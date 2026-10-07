"""
JumperDevice  —  API principal del protocolo Jumper
====================================================
Flujo de conexión completo:

  Initiator                           Responder
  ─────────                           ─────────
  HELLO  ─────────────────────────►
         ◄──────────────────────── KEM_INIT
  KEM_RESP ────────────────────────►
  (session established, < 5 ms)

  Después:
  STREAM_OPEN  ──────────────────►
  DATA (cifrado) ────────────────►
  DATA (cifrado) ◄────────────────

Descubrimiento:
  BEACON (broadcast cada 1 s) ───► todos los puertos locales
"""
import asyncio
import json
import logging
import time
from typing import Callable, Awaitable, Dict, List, Optional

from .frame import JumperFrame, FrameType, StreamID, PHYMode
from .secure import DeviceIdentity, JumperSecurity
from .session import JumperSession
from .transport import JumperTransport, DATA_PORT_BASE

logger = logging.getLogger("jumper.device")

BEACON_INTERVAL_S = 1.0
CONNECT_TIMEOUT_S = 8.0


class JumperDevice:
    """
    Punto de entrada principal del protocolo Jumper.

    Ejemplo rápido::

        device = await JumperDevice.create("MiDispositivo")
        await device.advertise()

        # Conectar a un peer
        session = await device.connect(("127.0.0.1", 55302))

        # Abrir stream de audio
        await session.open_stream(StreamID.AUDIO)
        await session.send(StreamID.AUDIO, pcm_data)
    """

    def __init__(
        self,
        name:      str,
        identity:  DeviceIdentity,
        transport: JumperTransport,
    ):
        self.name      = name
        self.identity  = identity
        self.security  = JumperSecurity(identity)
        self.transport = transport

        self.sessions: Dict[bytes, JumperSession]  = {}   # session_id → session
        self._discovered: Dict[str, dict]          = {}   # addr_key  → beacon info
        self._pending:    Dict[str, dict]           = {}   # addr_key  → pending handshake
        self._connect_futs: Dict[str, asyncio.Future] = {}

        self._running         = False
        self._on_connect_cb:  Optional[Callable[[JumperSession], Awaitable[None]]] = None

    # ── Factory ───────────────────────────────────────────────────────────

    @classmethod
    async def create(
        cls,
        name:      str,
        host:      str  = "127.0.0.1",
        port:      int  = 0,
        pq:        bool = False,
    ) -> "JumperDevice":
        identity  = DeviceIdentity.generate(pq=pq)
        transport = JumperTransport(host, port)
        device    = cls(name, identity, transport)
        await transport.start(device._on_receive)
        device._running = True
        logger.info(
            f"JumperDevice '{name}' up | id={identity.id_hex[:8]} "
            f"addr={transport.address} | crypto={'Kyber1024' if pq else 'X25519'}"
        )
        return device

    async def stop(self):
        self._running = False
        for s in list(self.sessions.values()):
            await s.close()
        await self.transport.stop()

    # ── Discovery / Advertising ───────────────────────────────────────────

    async def advertise(self):
        """Start broadcasting beacons for peer discovery."""
        asyncio.create_task(self._beacon_loop(), name=f"beacon-{self.name}")
        logger.info(f"'{self.name}' advertising on {self.transport.address}")

    async def _beacon_loop(self):
        while self._running:
            frame = JumperFrame(
                frame_type=FrameType.BEACON,
                payload=self._build_info_payload(),
            )
            await self.transport.broadcast(frame.encode())
            await asyncio.sleep(BEACON_INTERVAL_S)

    def _build_info_payload(self) -> bytes:
        return json.dumps({
            **self.identity.public_info(),
            "name":         self.name,
            "port":         self.transport.port,
            "capabilities": ["audio", "hid", "file", "video", "mesh"],
            "phy_modes":    ["UWB", "SUB6"],
        }).encode()

    def list_discovered(self) -> List[dict]:
        return list(self._discovered.values())

    # ── Connect ───────────────────────────────────────────────────────────

    async def connect(self, peer_addr: tuple) -> JumperSession:
        """
        Initiate a Jumper connection to peer_addr.
        Returns an active, encrypted JumperSession.
        """
        addr_key = f"{peer_addr[0]}:{peer_addr[1]}"

        # Register the future BEFORE sending — avoids asyncio race condition
        # (KEM_INIT could arrive during the send's await and miss the future)
        fut: asyncio.Future = asyncio.get_event_loop().create_future()
        self._connect_futs[addr_key] = fut

        # Send HELLO to get their public key
        hello = JumperFrame(
            frame_type=FrameType.HELLO,
            payload=self._build_info_payload(),
        )
        await self.transport.send(hello.encode(), peer_addr)

        try:
            session = await asyncio.wait_for(fut, timeout=CONNECT_TIMEOUT_S)
        except asyncio.TimeoutError:
            self._connect_futs.pop(addr_key, None)
            raise ConnectionError(f"Jumper connect timeout: {peer_addr}")

        logger.info(f"'{self.name}' connected to {peer_addr} — session {session.id_short}")
        return session

    def on_connect(self, cb: Callable[[JumperSession], Awaitable[None]]):
        """Register callback for incoming connections."""
        self._on_connect_cb = cb

    # ── Frame dispatch ────────────────────────────────────────────────────

    async def _on_receive(self, data: bytes, addr: tuple):
        try:
            frame = JumperFrame.decode(data)
        except Exception as e:
            logger.debug(f"Bad frame from {addr}: {e}")
            return

        addr_key = f"{addr[0]}:{addr[1]}"

        if frame.frame_type == FrameType.BEACON:
            self._handle_beacon(frame, addr)

        elif frame.frame_type == FrameType.HELLO:
            await self._handle_hello(frame, addr)

        elif frame.frame_type == FrameType.KEM_INIT:
            await self._handle_kem_init(frame, addr)

        elif frame.frame_type == FrameType.KEM_RESP:
            await self._handle_kem_resp(frame, addr)

        else:
            # Route to existing session
            session = self.sessions.get(frame.session_id)
            if session:
                await session.receive_frame(frame)

    # ── Handshake handlers ────────────────────────────────────────────────

    def _handle_beacon(self, frame: JumperFrame, addr: tuple):
        try:
            info     = json.loads(frame.payload)
            port     = info.get("port", addr[1])
            addr_key = f"{addr[0]}:{port}"
            self._discovered[addr_key] = {**info, "_addr": (addr[0], port)}
        except Exception:
            pass

    async def _handle_hello(self, frame: JumperFrame, addr: tuple):
        """Peer is connecting to us: compute KEM_INIT and send."""
        try:
            peer_info = json.loads(frame.payload)
        except Exception:
            return

        addr_key      = f"{addr[0]}:{addr[1]}"
        peer_pubkey   = bytes.fromhex(peer_info["public_key"])
        peer_id       = bytes.fromhex(peer_info["device_id"])
        session_id    = JumperSecurity.generate_session_id()

        session_key, kem_material = self.security.initiate_handshake(peer_pubkey)

        self._pending[addr_key] = {
            "session_id":     session_id,
            "session_key":    session_key,
            "peer_device_id": peer_id,
            "peer_addr":      addr,
            "peer_name":      peer_info.get("name", "unknown"),
        }

        kem_init = JumperFrame(
            frame_type=FrameType.KEM_INIT,
            session_id=session_id,
            payload=json.dumps({
                **self.identity.public_info(),
                "name":         self.name,
                "kem_material": kem_material.hex(),
            }).encode(),
        )
        await self.transport.send(kem_init.encode(), addr)
        logger.debug(f"KEM_INIT → {addr} session={session_id.hex()[:8]}")

    async def _handle_kem_init(self, frame: JumperFrame, addr: tuple):
        """We are the responder: complete handshake, send KEM_RESP."""
        try:
            data = json.loads(frame.payload)
        except Exception:
            return

        addr_key      = f"{addr[0]}:{addr[1]}"
        kem_material  = bytes.fromhex(data["kem_material"])
        peer_id       = bytes.fromhex(data["device_id"])
        session_id    = frame.session_id

        session_key = self.security.complete_handshake(kem_material)
        session     = self._create_session(session_id, session_key, addr, peer_id)

        resp = JumperFrame(
            frame_type=FrameType.KEM_RESP,
            session_id=session_id,
            payload=json.dumps({
                **self.identity.public_info(),
                "name":     self.name,
                "status":   "ok",
                "phy_mode": int(PHYMode.UWB),
            }).encode(),
        )
        await self.transport.send(resp.encode(), addr)
        logger.info(
            f"Session established (responder) {session_id.hex()[:8]}"
            f" ← '{data.get('name', addr)}'"
        )

        # Resolve connect() future if we initiated this connection via connect()
        fut = self._connect_futs.pop(addr_key, None)
        if fut and not fut.done():
            fut.set_result(session)

        if self._on_connect_cb:
            cb = self._on_connect_cb
            async def _run_cb():
                try:
                    await cb(session)
                except Exception as e:
                    logger.error(f"on_connect callback error: {e}")
            asyncio.create_task(_run_cb())

    async def _handle_kem_resp(self, frame: JumperFrame, addr: tuple):
        """We are the initiator: finalize session from pending handshake."""
        addr_key = f"{addr[0]}:{addr[1]}"
        pending  = self._pending.pop(addr_key, None)
        if not pending:
            return

        try:
            data = json.loads(frame.payload)
        except Exception:
            return

        if data.get("status") != "ok":
            logger.warning(f"Handshake rejected by {addr}")
            fut = self._connect_futs.pop(addr_key, None)
            if fut and not fut.done():
                fut.set_exception(ConnectionRefusedError("Peer rejected handshake"))
            return

        session = self._create_session(
            pending["session_id"],
            pending["session_key"],
            addr,
            pending["peer_device_id"],
        )
        logger.info(
            f"Session established (initiator) {pending['session_id'].hex()[:8]}"
            f" → '{data.get('name', addr)}'"
        )

        fut = self._connect_futs.pop(addr_key, None)
        if fut and not fut.done():
            fut.set_result(session)

        if self._on_connect_cb:
            cb = self._on_connect_cb
            async def _run_cb_resp():
                try:
                    await cb(session)
                except Exception as e:
                    logger.error(f"on_connect callback error: {e}")
            asyncio.create_task(_run_cb_resp())

    # ── Session factory ───────────────────────────────────────────────────

    def _create_session(
        self,
        session_id:     bytes,
        session_key:    bytes,
        peer_addr:      tuple,
        peer_device_id: bytes,
    ) -> JumperSession:
        session = JumperSession(
            session_id     = session_id,
            session_key    = session_key,
            peer_addr      = peer_addr,
            peer_device_id = peer_device_id,
            security       = self.security,
            send_fn        = self.transport.send,
        )
        self.sessions[session_id] = session
        asyncio.create_task(session.keepalive_loop(), name=f"ka-{session.id_short}")
        return session

    # ── Properties ───────────────────────────────────────────────────────

    @property
    def address(self) -> tuple:
        return self.transport.address

    @property
    def device_id(self) -> str:
        return self.identity.id_hex

    def info(self) -> dict:
        return {
            "name":       self.name,
            "device_id":  self.identity.id_hex,
            "address":    f"{self.address[0]}:{self.address[1]}",
            "crypto":     self.security.crypto_info,
            "phy":        self.transport.stats(),
            "sessions":   len(self.sessions),
            "discovered": len(self._discovered),
        }
