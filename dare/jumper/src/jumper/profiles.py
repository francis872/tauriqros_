"""
Jumper Application Profiles
============================
JMP-Audio   — 24-bit/96kHz PCM lossless, latencia garantizada < 2 ms
JMP-HID     — eventos de entrada (teclado/mouse/gamepad), < 1 ms round-trip
JMP-File    — transferencia con integridad SHA-256, multi-Gbps en mmW
"""
import asyncio
import hashlib
import json
import struct
import time
import logging
from dataclasses import dataclass, field
from enum import IntEnum
from pathlib import Path
from typing import AsyncIterator, Callable, Optional

from .frame import StreamID
from .session import JumperSession

logger = logging.getLogger("jumper.profiles")


# ═══════════════════════════════════════════════════════════════════════════════
#  JMP-AUDIO
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class AudioConfig:
    sample_rate: int   = 96_000   # Hz
    bit_depth:   int   = 24       # bits per sample
    channels:    int   = 2        # stereo
    codec:       str   = "PCM"    # PCM (lossless) | OPUS
    chunk_ms:    float = 2.0      # target chunk duration

    @property
    def chunk_frames(self) -> int:
        return int(self.sample_rate * self.chunk_ms / 1000)

    @property
    def chunk_bytes(self) -> int:
        return self.chunk_frames * self.channels * (self.bit_depth // 8)

    @property
    def bitrate_kbps(self) -> float:
        return self.sample_rate * self.bit_depth * self.channels / 1000

    def encode(self) -> bytes:
        return struct.pack(
            "!IHHH8s",
            self.sample_rate,
            self.bit_depth,
            self.channels,
            int(self.chunk_ms * 10),
            self.codec.encode().ljust(8, b"\x00"),
        )

    @classmethod
    def decode(cls, data: bytes) -> "AudioConfig":
        sr, bd, ch, cms, codec = struct.unpack("!IHHH8s", data[:18])
        return cls(
            sample_rate=sr,
            bit_depth=bd,
            channels=ch,
            chunk_ms=cms / 10.0,
            codec=codec.rstrip(b"\x00").decode(),
        )


# Packet types inside AUDIO stream
_AUDIO_CONFIG = 0x01
_AUDIO_CHUNK  = 0x02
_AUDIO_PAUSE  = 0x03
_AUDIO_RESUME = 0x04


class AudioSender:
    """
    JMP-Audio sender.

    Usage::
        sender = AudioSender(session)
        await sender.start()
        await sender.send_chunk(pcm_bytes)
        # or
        await sender.stream(my_async_generator())
    """

    def __init__(self, session: JumperSession, config: Optional[AudioConfig] = None):
        self.session = session
        self.config  = config or AudioConfig()
        self._seq    = 0
        self._stats  = {"chunks": 0, "bytes": 0, "latencies_ms": []}

    async def start(self):
        await self.session.open_stream(StreamID.AUDIO)
        cfg_pkt = bytes([_AUDIO_CONFIG]) + self.config.encode()
        await self.session.send(StreamID.AUDIO, cfg_pkt)
        logger.info(
            f"AudioSender started — {self.config.sample_rate} Hz / "
            f"{self.config.bit_depth}-bit / {self.config.channels}ch "
            f"({self.config.bitrate_kbps:.0f} kbps raw)"
        )

    async def send_chunk(self, pcm: bytes) -> float:
        """Send one PCM chunk. Returns actual send latency (ms)."""
        t0     = time.monotonic()
        ts_ms  = int(time.time() * 1_000)
        header = struct.pack("!BIQ", _AUDIO_CHUNK, self._seq, ts_ms)
        self._seq = (self._seq + 1) & 0xFFFF_FFFF
        await self.session.send(StreamID.AUDIO, header + pcm)
        lat = (time.monotonic() - t0) * 1000
        self._stats["chunks"] += 1
        self._stats["bytes"]  += len(pcm)
        self._stats["latencies_ms"].append(lat)
        return lat

    async def stream(self, gen: AsyncIterator[bytes]):
        """Stream audio from an async generator yielding PCM chunks."""
        await self.start()
        async for chunk in gen:
            await self.send_chunk(chunk)

    @property
    def stats(self) -> dict:
        lats = self._stats["latencies_ms"][-200:]
        return {
            "chunks":       self._stats["chunks"],
            "bytes":        self._stats["bytes"],
            "avg_lat_ms":   round(sum(lats) / len(lats), 3) if lats else 0,
            "max_lat_ms":   round(max(lats), 3) if lats else 0,
        }


class AudioReceiver:
    """
    JMP-Audio receiver.

    Usage::
        receiver = AudioReceiver(session)
        await receiver.start()
        while True:
            chunk = await receiver.recv_chunk()
            play(chunk)
    """

    def __init__(self, session: JumperSession):
        self.session    = session
        self.config:    Optional[AudioConfig] = None
        self._queue:    asyncio.Queue = asyncio.Queue(maxsize=200)
        self._callback: Optional[Callable[[bytes], None]] = None
        self._stats     = {"chunks": 0, "bytes": 0, "dropped": 0}

    async def start(self, callback: Optional[Callable[[bytes], None]] = None):
        self._callback = callback
        await self.session.open_stream(StreamID.AUDIO)
        self.session.on_stream_data(StreamID.AUDIO, self._on_data)

    async def _on_data(self, _sid: int, data: bytes):
        ptype = data[0]
        if ptype == _AUDIO_CONFIG:
            self.config = AudioConfig.decode(data[1:])
            logger.info(f"AudioReceiver: config received {self.config.sample_rate} Hz")
        elif ptype == _AUDIO_CHUNK:
            _seq, _ts = struct.unpack_from("!IQ", data, 1)
            pcm = data[1 + 4 + 8:]
            self._stats["chunks"] += 1
            self._stats["bytes"]  += len(pcm)
            if self._callback:
                self._callback(pcm)
            elif self._queue.full():
                self._stats["dropped"] += 1
            else:
                self._queue.put_nowait(pcm)

    async def recv_chunk(self, timeout: float = 0.5) -> Optional[bytes]:
        try:
            return await asyncio.wait_for(self._queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            return None

    @property
    def stats(self) -> dict:
        return dict(self._stats)


# ═══════════════════════════════════════════════════════════════════════════════
#  JMP-HID
# ═══════════════════════════════════════════════════════════════════════════════

class HIDEventType(IntEnum):
    KEY_DOWN          = 0x01
    KEY_UP            = 0x02
    MOUSE_MOVE        = 0x10
    MOUSE_BUTTON_DOWN = 0x11
    MOUSE_BUTTON_UP   = 0x12
    MOUSE_SCROLL      = 0x13
    GAMEPAD           = 0x20
    TOUCH             = 0x30
    CUSTOM            = 0xFF


@dataclass
class HIDEvent:
    event_type:   int
    data:         bytes
    timestamp_ms: int = field(default_factory=lambda: int(time.time() * 1_000))

    def encode(self) -> bytes:
        return struct.pack("!BQ", self.event_type, self.timestamp_ms) + self.data

    @classmethod
    def decode(cls, raw: bytes) -> "HIDEvent":
        etype, ts = struct.unpack_from("!BQ", raw)
        return cls(event_type=etype, data=raw[9:], timestamp_ms=ts)

    # ── Convenience constructors ──────────────────────────────────────────

    @classmethod
    def key_down(cls, keycode: int) -> "HIDEvent":
        return cls(HIDEventType.KEY_DOWN, struct.pack("!H", keycode))

    @classmethod
    def key_up(cls, keycode: int) -> "HIDEvent":
        return cls(HIDEventType.KEY_UP, struct.pack("!H", keycode))

    @classmethod
    def mouse_move(cls, dx: int, dy: int) -> "HIDEvent":
        return cls(HIDEventType.MOUSE_MOVE, struct.pack("!hh", dx, dy))

    @classmethod
    def mouse_click(cls, button: int, down: bool) -> "HIDEvent":
        etype = HIDEventType.MOUSE_BUTTON_DOWN if down else HIDEventType.MOUSE_BUTTON_UP
        return cls(etype, struct.pack("!B", button))

    @classmethod
    def mouse_scroll(cls, delta: int) -> "HIDEvent":
        return cls(HIDEventType.MOUSE_SCROLL, struct.pack("!h", delta))

    @classmethod
    def gamepad(cls, axes: list[float], buttons: int) -> "HIDEvent":
        # Up to 8 axes (float32 each) + button bitmask (uint16)
        data = struct.pack(f"!{len(axes)}fH", *axes, buttons)
        return cls(HIDEventType.GAMEPAD, data)


class HIDProfile:
    """
    JMP-HID: < 1 ms round-trip latency for control input.

    Usage::
        hid = HIDProfile(session)
        await hid.start()

        # Sender side
        lat = await hid.send_event(HIDEvent.key_down(0x41))  # 'A'

        # Receiver side
        hid.on_event(my_handler)
    """

    def __init__(self, session: JumperSession):
        self.session   = session
        self._cbs:     list[Callable] = []
        self._latencies: list[float]  = []

    async def start(self):
        await self.session.open_stream(StreamID.HID)
        self.session.on_stream_data(StreamID.HID, self._on_data)

    async def send_event(self, event: HIDEvent) -> float:
        t0 = time.monotonic()
        await self.session.send(StreamID.HID, event.encode())
        lat = (time.monotonic() - t0) * 1000
        self._latencies.append(lat)
        if len(self._latencies) > 500:
            self._latencies.pop(0)
        return lat

    async def _on_data(self, _sid: int, data: bytes):
        event = HIDEvent.decode(data)
        for cb in self._cbs:
            if asyncio.iscoroutinefunction(cb):
                await cb(event)
            else:
                cb(event)

    def on_event(self, cb: Callable[[HIDEvent], None]):
        self._cbs.append(cb)

    @property
    def avg_latency_ms(self) -> float:
        lats = self._latencies[-100:]
        return sum(lats) / len(lats) if lats else 0.0

    @property
    def p99_latency_ms(self) -> float:
        if not self._latencies:
            return 0.0
        s = sorted(self._latencies)
        return s[int(len(s) * 0.99)]


# ═══════════════════════════════════════════════════════════════════════════════
#  JMP-FILE
# ═══════════════════════════════════════════════════════════════════════════════

_FILE_MANIFEST  = 0x01
_FILE_CHUNK     = 0x02
_FILE_EOF       = 0x03
_FILE_ACK       = 0x04
_FILE_ERROR     = 0x05

DEFAULT_CHUNK   = 65_536   # 64 KB


class FileSender:
    """
    JMP-File: Send a file with SHA-256 integrity.

    Usage::
        sender = FileSender(session)
        result = await sender.send_file("/path/to/video.mp4")
        print(result["throughput_mbps"])
    """

    def __init__(self, session: JumperSession, chunk_size: int = DEFAULT_CHUNK):
        self.session    = session
        self.chunk_size = chunk_size
        self._progress: Optional[Callable[[int, int], None]] = None

    def on_progress(self, cb: Callable[[int, int], None]):
        """cb(bytes_sent, total_bytes)"""
        self._progress = cb

    async def send_file(self, path: str | Path) -> dict:
        path  = Path(path)
        data  = path.read_bytes()
        sha   = hashlib.sha256(data).hexdigest()
        total = len(data)

        await self.session.open_stream(StreamID.FILE)

        # 1. Manifest
        manifest = struct.pack("!B", _FILE_MANIFEST) + json.dumps({
            "filename":   path.name,
            "total_bytes": total,
            "sha256":     sha,
            "chunk_size": self.chunk_size,
        }).encode()
        await self.session.send(StreamID.FILE, manifest)

        # 2. Chunks
        t0       = time.monotonic()
        sent     = 0
        chunk_no = 0

        while sent < total:
            chunk  = data[sent : sent + self.chunk_size]
            header = struct.pack("!BII", _FILE_CHUNK, chunk_no, len(chunk))
            await self.session.send(StreamID.FILE, header + chunk)
            sent     += len(chunk)
            chunk_no += 1
            if self._progress:
                self._progress(sent, total)

        # 3. EOF
        eof_pkt = struct.pack("!B", _FILE_EOF) + sha.encode()
        await self.session.send(StreamID.FILE, eof_pkt)

        elapsed = time.monotonic() - t0
        mbps    = (total * 8 / 1e6) / elapsed if elapsed > 0 else 0

        result = {
            "filename":        path.name,
            "bytes":           total,
            "sha256":          sha,
            "chunks":          chunk_no,
            "time_s":          round(elapsed, 3),
            "throughput_mbps": round(mbps, 2),
        }
        logger.info(
            f"FileSender: '{path.name}' {total/1024:.1f} KB "
            f"in {elapsed*1000:.0f} ms ({mbps:.1f} Mbps)"
        )
        return result


class FileReceiver:
    """
    JMP-File: Receive a file and verify integrity.

    Usage::
        receiver = FileReceiver(session, output_dir="/downloads")
        done = await receiver.start()
        result = await done          # blocks until file is fully received
        print(result["saved_to"])
    """

    def __init__(self, session: JumperSession, output_dir: str | Path = "."):
        self.session    = session
        self.output_dir = Path(output_dir)
        self._manifest: Optional[dict]         = None
        self._chunks:   dict[int, bytes]        = {}
        self._future:   Optional[asyncio.Future] = None

    async def start(self) -> asyncio.Future:
        self.output_dir.mkdir(parents=True, exist_ok=True)
        await self.session.open_stream(StreamID.FILE)
        self.session.on_stream_data(StreamID.FILE, self._on_data)
        self._future = asyncio.get_event_loop().create_future()
        return self._future

    async def _on_data(self, _sid: int, data: bytes):
        ptype = data[0]

        if ptype == _FILE_MANIFEST:
            self._manifest = json.loads(data[1:])
            self._chunks   = {}
            logger.info(
                f"FileReceiver: incoming '{self._manifest['filename']}' "
                f"({self._manifest['total_bytes']/1024:.1f} KB)"
            )

        elif ptype == _FILE_CHUNK:
            num, clen = struct.unpack_from("!II", data, 1)
            self._chunks[num] = data[9 : 9 + clen]

        elif ptype == _FILE_EOF:
            await self._assemble(data[1:].decode())

    async def _assemble(self, received_sha: str):
        if not self._manifest:
            return

        full = b"".join(self._chunks[i] for i in sorted(self._chunks))
        sha  = hashlib.sha256(full).hexdigest()
        ok   = (sha == received_sha == self._manifest["sha256"])

        result: dict = {
            "filename":  self._manifest["filename"],
            "bytes":     len(full),
            "sha256":    sha,
            "integrity": ok,
        }

        if ok:
            out = self.output_dir / self._manifest["filename"]
            out.write_bytes(full)
            result["saved_to"] = str(out)
            logger.info(f"FileReceiver: '{out}' saved — integrity OK")
        else:
            logger.error(
                f"FileReceiver: integrity FAIL "
                f"expected={self._manifest['sha256'][:8]} got={sha[:8]}"
            )

        if self._future and not self._future.done():
            self._future.set_result(result)
