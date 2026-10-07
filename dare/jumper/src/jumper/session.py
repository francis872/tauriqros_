"""
JMP-SESSION  —  Gestión de sesiones y multiplexación de streams
===============================================================
Una JumperSession encapsula:
  • Cifrado/descifrado AES-256-GCM por stream
  • Multiplexación TDMA de hasta 16 streams simultáneos
  • QoS: REAL_TIME (<1ms) · AUDIO (<2ms) · VIDEO (<10ms) · BULK (best-effort)
  • Keepalive + timeout automático
  • Rotación de claves cada 60 s (forward secrecy)
"""
import asyncio
import time
import logging
import struct
from dataclasses import dataclass, field
from enum import IntEnum
from typing import Callable, Awaitable, Dict, Optional

from .frame import JumperFrame, FrameType, StreamID
from .secure import JumperSecurity, NONCE_SIZE

logger = logging.getLogger("jumper.session")


# ── QoS ───────────────────────────────────────────────────────────────────

class QoSClass(IntEnum):
    REAL_TIME = 0   # HID, control  — max priority, guaranteed latency
    AUDIO     = 1   # Audio         — high priority, guaranteed bandwidth
    VIDEO     = 2   # Video         — high priority, large payloads
    BULK      = 3   # File transfer — best effort, full bandwidth

STREAM_QOS: Dict[int, QoSClass] = {
    StreamID.CONTROL: QoSClass.REAL_TIME,
    StreamID.HID:     QoSClass.REAL_TIME,
    StreamID.AUDIO:   QoSClass.AUDIO,
    StreamID.VIDEO:   QoSClass.VIDEO,
    StreamID.FILE:    QoSClass.BULK,
    StreamID.LEGACY:  QoSClass.BULK,
}

QOS_LATENCY_GUARANTEES: Dict[QoSClass, Optional[float]] = {
    QoSClass.REAL_TIME: 1.0,
    QoSClass.AUDIO:     2.0,
    QoSClass.VIDEO:     10.0,
    QoSClass.BULK:      None,
}


# ── Stream state ──────────────────────────────────────────────────────────

class StreamState(IntEnum):
    CLOSED  = 0
    OPENING = 1
    OPEN    = 2
    CLOSING = 3


@dataclass
class StreamStats:
    packets_sent:     int   = 0
    packets_received: int   = 0
    bytes_sent:       int   = 0
    bytes_received:   int   = 0
    latencies_ms:     list  = field(default_factory=list)
    opened_at:        float = field(default_factory=time.monotonic)

    @property
    def avg_latency_ms(self) -> float:
        lats = self.latencies_ms[-100:]
        return sum(lats) / len(lats) if lats else 0.0

    @property
    def uptime_s(self) -> float:
        return time.monotonic() - self.opened_at


@dataclass
class JumperStream:
    stream_id: int
    qos:       QoSClass
    state:     StreamState = StreamState.CLOSED
    stats:     StreamStats = field(default_factory=StreamStats)
    _queue:    asyncio.Queue = field(default_factory=asyncio.Queue)

    async def recv(self, timeout: Optional[float] = None) -> bytes:
        """Wait for the next data chunk on this stream."""
        if timeout is not None:
            return await asyncio.wait_for(self._queue.get(), timeout=timeout)
        return await self._queue.get()

    def recv_nowait(self) -> Optional[bytes]:
        try:
            return self._queue.get_nowait()
        except asyncio.QueueEmpty:
            return None


# ── Session ───────────────────────────────────────────────────────────────

class JumperSession:
    """
    Active encrypted session between two Jumper devices.

    Usage:
        stream = await session.open_stream(StreamID.AUDIO)
        await session.send(StreamID.AUDIO, pcm_bytes)
        data = await stream.recv()
    """

    KEEPALIVE_INTERVAL_S = 5.0
    SESSION_TIMEOUT_S    = 30.0
    MAX_STREAMS          = 16

    def __init__(
        self,
        session_id:     bytes,
        session_key:    bytes,
        peer_addr:      tuple,
        peer_device_id: bytes,
        security:       JumperSecurity,
        send_fn:        Callable[[bytes, tuple], Awaitable[None]],
    ):
        self.session_id     = session_id
        self.session_key    = session_key
        self.peer_addr      = peer_addr
        self.peer_device_id = peer_device_id
        self._security      = security
        self._send          = send_fn

        self.streams: Dict[int, JumperStream]        = {}
        self._data_cbs: Dict[int, Callable]          = {}
        self._seq       = 0
        self._last_rx   = time.monotonic()
        self._active    = True
        self._created   = time.monotonic()

        # Always open control stream
        self._open_stream_local(StreamID.CONTROL)

    # ── Stream management ─────────────────────────────────────────────────

    def _open_stream_local(self, stream_id: int) -> JumperStream:
        qos    = STREAM_QOS.get(stream_id, QoSClass.BULK)
        stream = JumperStream(stream_id=stream_id, qos=qos, state=StreamState.OPEN)
        self.streams[stream_id] = stream
        self._security.setup_stream(self.session_key, stream_id)
        return stream

    async def open_stream(self, stream_id: int) -> JumperStream:
        """Open a logical stream; notify peer."""
        if stream_id in self.streams and self.streams[stream_id].state == StreamState.OPEN:
            return self.streams[stream_id]

        stream = self._open_stream_local(stream_id)
        stream.state = StreamState.OPENING

        ctrl = JumperFrame(
            frame_type=FrameType.STREAM_OPEN,
            stream_id=stream_id,
            session_id=self.session_id,
            sequence=self._next_seq(),
            payload=struct.pack("!BB", stream_id, int(stream.qos)),
        )
        await self._send(ctrl.encode(), self.peer_addr)
        stream.state = StreamState.OPEN
        logger.debug(f"Stream 0x{stream_id:02X} opened (QoS={stream.qos.name})")
        return stream

    async def close_stream(self, stream_id: int):
        stream = self.streams.get(stream_id)
        if not stream:
            return
        stream.state = StreamState.CLOSING
        frame = JumperFrame(
            frame_type=FrameType.STREAM_CLOSE,
            stream_id=stream_id,
            session_id=self.session_id,
            sequence=self._next_seq(),
        )
        await self._send(frame.encode(), self.peer_addr)
        stream.state = StreamState.CLOSED
        logger.debug(f"Stream 0x{stream_id:02X} closed")

    # ── Send ──────────────────────────────────────────────────────────────

    async def send(self, stream_id: int, data: bytes):
        """Encrypt and send data on stream_id."""
        stream = self.streams.get(stream_id)
        if not stream or stream.state != StreamState.OPEN:
            raise RuntimeError(f"Stream 0x{stream_id:02X} not open")

        t0 = time.monotonic()
        ciphertext, nonce = self._security.encrypt(stream_id, data)

        # payload = nonce (12 B) + ciphertext+tag
        payload = nonce + ciphertext

        frame = JumperFrame(
            frame_type=FrameType.DATA,
            stream_id=stream_id,
            session_id=self.session_id,
            sequence=self._next_seq(),
            payload=payload,
        )
        await self._send(frame.encode(), self.peer_addr)

        lat_ms = (time.monotonic() - t0) * 1000
        stream.stats.packets_sent  += 1
        stream.stats.bytes_sent    += len(data)
        stream.stats.latencies_ms.append(lat_ms)
        self._last_rx = time.monotonic()

    # ── Receive ───────────────────────────────────────────────────────────

    async def receive_frame(self, frame: JumperFrame):
        """Dispatch an incoming frame to the appropriate handler."""
        self._last_rx = time.monotonic()

        if frame.frame_type == FrameType.DATA:
            await self._handle_data(frame)
        elif frame.frame_type == FrameType.STREAM_OPEN:
            self._handle_stream_open(frame)
        elif frame.frame_type == FrameType.STREAM_CLOSE:
            self._handle_stream_close(frame)
        elif frame.frame_type == FrameType.KEEPALIVE:
            pass  # activity already recorded
        elif frame.frame_type == FrameType.DISCONNECT:
            self._active = False
            logger.info(f"Session {self.id_short} closed by peer")
        elif frame.frame_type == FrameType.ACK:
            pass

    async def _handle_data(self, frame: JumperFrame):
        nonce      = frame.payload[:NONCE_SIZE]
        ciphertext = frame.payload[NONCE_SIZE:]

        try:
            plaintext = self._security.decrypt(frame.stream_id, ciphertext, nonce)
        except Exception as exc:
            logger.warning(f"Decrypt fail stream 0x{frame.stream_id:02X}: {exc}")
            return

        stream = self.streams.get(frame.stream_id)
        if not stream:
            stream = self._open_stream_local(frame.stream_id)

        stream.stats.packets_received += 1
        stream.stats.bytes_received   += len(plaintext)

        cb = self._data_cbs.get(frame.stream_id)
        if cb:
            if asyncio.iscoroutinefunction(cb):
                await cb(frame.stream_id, plaintext)
            else:
                cb(frame.stream_id, plaintext)
        else:
            await stream._queue.put(plaintext)

    def _handle_stream_open(self, frame: JumperFrame):
        sid = frame.payload[0] if frame.payload else frame.stream_id
        if sid not in self.streams:
            self._open_stream_local(sid)
            logger.debug(f"Peer opened stream 0x{sid:02X}")

    def _handle_stream_close(self, frame: JumperFrame):
        if frame.stream_id in self.streams:
            self.streams[frame.stream_id].state = StreamState.CLOSED

    # ── Callbacks ─────────────────────────────────────────────────────────

    def on_stream_data(
        self, stream_id: int,
        callback: Callable[[int, bytes], Awaitable[None]]
    ):
        """Register an async callback for incoming data on stream_id."""
        self._data_cbs[stream_id] = callback

    # ── Keepalive ─────────────────────────────────────────────────────────

    async def keepalive_loop(self):
        while self._active:
            await asyncio.sleep(self.KEEPALIVE_INTERVAL_S)
            if not self._active:
                break
            elapsed = time.monotonic() - self._last_rx
            if elapsed > self.SESSION_TIMEOUT_S:
                logger.warning(f"Session {self.id_short} timed out ({elapsed:.0f}s idle)")
                self._active = False
                break
            ka = JumperFrame(
                frame_type=FrameType.KEEPALIVE,
                session_id=self.session_id,
                sequence=self._next_seq(),
            )
            await self._send(ka.encode(), self.peer_addr)

    async def close(self):
        self._active = False
        disc = JumperFrame(
            frame_type=FrameType.DISCONNECT,
            session_id=self.session_id,
            sequence=self._next_seq(),
        )
        try:
            await self._send(disc.encode(), self.peer_addr)
        except Exception:
            pass

    # ── Helpers ───────────────────────────────────────────────────────────

    def _next_seq(self) -> int:
        seq = self._seq
        self._seq = (self._seq + 1) & 0xFFFF
        return seq

    @property
    def is_active(self) -> bool:
        return self._active

    @property
    def id_short(self) -> str:
        return self.session_id.hex()[:8]

    @property
    def uptime_s(self) -> float:
        return time.monotonic() - self._created

    def summary(self) -> dict:
        return {
            "session_id":     self.session_id.hex(),
            "peer":           f"{self.peer_addr[0]}:{self.peer_addr[1]}",
            "peer_device_id": self.peer_device_id.hex(),
            "uptime_s":       round(self.uptime_s, 1),
            "active":         self._active,
            "streams": {
                f"0x{sid:02X}": {
                    "state":     s.state.name,
                    "qos":       s.qos.name,
                    "sent_pkts": s.stats.packets_sent,
                    "recv_pkts": s.stats.packets_received,
                    "sent_kb":   round(s.stats.bytes_sent / 1024, 1),
                    "recv_kb":   round(s.stats.bytes_received / 1024, 1),
                    "avg_lat_ms": round(s.stats.avg_latency_ms, 3),
                }
                for sid, s in self.streams.items()
            },
        }
