"""
JMP-PHY (Transport)  —  Capa física simulada sobre UDP
=======================================================
En producción: reemplazar JumperTransport por la interfaz
del chip radio real (DW3000 para UWB, etc.).
"""
import asyncio
import socket
import logging
from typing import Awaitable, Callable, Optional

from .frame import PHYMode, PHY_PROFILES, select_phy

logger = logging.getLogger("jumper.transport")

DATA_PORT_BASE     = 55301
SIM_LATENCY_FACTOR = 0.05

# Windows socket error codes to silently ignore
_WIN_IGNORE = {10035, 10054}  # WSAEWOULDBLOCK, WSAECONNRESET


class JumperTransport:
    """
    UDP socket transport simulating Jumper radio.
    Uses a blocking socket in a thread-pool executor for receives.
    """

    def __init__(self, host: str = "127.0.0.1", port: int = 0):
        self.host     = host
        self.port     = port
        self.mode     = PHYMode.UWB
        self._sock:   Optional[socket.socket] = None
        self._loop:   Optional[asyncio.AbstractEventLoop] = None
        self._running = False

    async def start(self, recv_callback: Callable[[bytes, tuple], Awaitable[None]]):
        self._loop = asyncio.get_event_loop()
        self._sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self._sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self._sock.bind((self.host, self.port))
        self._sock.settimeout(1.0)   # 1-second timeout for clean shutdown
        self.port     = self._sock.getsockname()[1]
        self._running = True
        asyncio.create_task(self._recv_loop(recv_callback), name=f"jmp-recv-{self.port}")
        logger.info(f"JumperTransport bound {self.host}:{self.port} mode={self.mode.name}")

    async def stop(self):
        self._running = False
        if self._sock:
            try:
                self._sock.close()
            except OSError:
                pass
            self._sock = None

    # ── I/O ───────────────────────────────────────────────────────────────

    async def send(self, data: bytes, addr: tuple):
        if not self._sock or not self._running:
            return
        delay = PHY_PROFILES[self.mode]["latency_ms"] / 1000.0 * SIM_LATENCY_FACTOR
        if delay > 0:
            await asyncio.sleep(delay)
        if self._sock:
            try:
                self._sock.sendto(data, addr)
            except OSError as e:
                if hasattr(e, "winerror") and e.winerror in _WIN_IGNORE:
                    pass
                else:
                    logger.debug(f"sendto {addr}: {e}")

    async def broadcast(self, data: bytes):
        if not self._sock or not self._running:
            return
        for port in range(DATA_PORT_BASE, DATA_PORT_BASE + 20):
            if port != self.port and self._sock:
                try:
                    self._sock.sendto(data, ("127.0.0.1", port))
                except OSError:
                    pass

    async def _recv_loop(self, callback: Callable[[bytes, tuple], Awaitable[None]]):
        while self._running:
            try:
                data, addr = await self._loop.run_in_executor(
                    None, self._recv_one
                )
                if data:
                    asyncio.create_task(callback(data, addr))
            except OSError as e:
                winerr = getattr(e, "winerror", None)
                if winerr in _WIN_IGNORE:
                    await asyncio.sleep(0.001)
                elif self._running:
                    logger.debug(f"recv: {e}")
                    await asyncio.sleep(0.01)
            except Exception as e:
                if self._running:
                    logger.debug(f"recv loop: {e}")
                await asyncio.sleep(0.01)

    def _recv_one(self) -> tuple[bytes, tuple]:
        """Blocking recv with 1s timeout — called from thread executor."""
        if not self._sock:
            return b"", ("", 0)
        try:
            return self._sock.recvfrom(65535)
        except socket.timeout:
            return b"", ("", 0)

    # ── PHY Mode ──────────────────────────────────────────────────────────

    def set_mode(self, mode: PHYMode):
        old = self.mode
        self.mode = mode
        if old != mode:
            logger.info(f"PHY {old.name}→{mode.name} ({PHY_PROFILES[mode]['max_mbps']} Mbps)")

    def negotiate_mode(self, distance_m: float, use_case: str) -> PHYMode:
        mode = select_phy(distance_m, use_case)
        self.set_mode(mode)
        return mode

    @property
    def address(self) -> tuple[str, int]:
        return (self.host, self.port)

    @property
    def profile(self) -> dict:
        return PHY_PROFILES[self.mode]

    def stats(self) -> dict:
        return {
            "address":    f"{self.host}:{self.port}",
            "mode":       self.mode.name,
            "max_mbps":   self.profile["max_mbps"],
            "latency_ms": self.profile["latency_ms"],
            "tx_mw":      self.profile["tx_mw"],
        }


