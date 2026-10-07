"""
Jumper Bridge  —  Puente de compatibilidad con sistemas legados
===============================================================
Permite que dispositivos Bluetooth clásico o BLE se comuniquen
con un host Jumper a través de un proxy TCP/UDP.

Arquitectura:

  [Dispositivo BT]  ─BLE/TCP─►  [JumperBridge]  ─JMP stream 0xB0─►  [Host Jumper]
  [Dispositivo WiFi]─UDP──────►  [JumperBridge]  ─JMP stream 0xB0─►  [Host Jumper]

El bridge:
  1. Escucha conexiones legacy en TCP (simulando un adaptador BT/WiFi)
  2. Encapsula los datos en JMP con stream_id=LEGACY (0xB0)
  3. Reenvía las respuestas del host Jumper de vuelta al dispositivo legacy
  4. Añade una cabecera de metadatos (protocolo de origen, handle GATT, etc.)

Formato del payload 0xB0:
  [1B protocol] [1B reserved] [2B handle] [4B seq] [rest: raw data]
  protocol: 0x01=BLE_GATT  0x02=BLE_ADV  0x10=WIFI_DIRECT  0xFF=RAW_TCP
"""
import asyncio
import struct
import logging
import time
from enum import IntEnum
from typing import Callable, Dict, Optional

from .frame import StreamID
from .session import JumperSession

logger = logging.getLogger("jumper.bridge")

BRIDGE_TCP_HOST = "127.0.0.1"
BRIDGE_TCP_PORT = 55400


class LegacyProtocol(IntEnum):
    BLE_GATT    = 0x01
    BLE_ADV     = 0x02
    WIFI_DIRECT = 0x10
    RAW_TCP     = 0xFF


def encode_legacy_payload(
    protocol: LegacyProtocol,
    handle:   int,
    seq:      int,
    data:     bytes,
) -> bytes:
    return struct.pack("!BBHI", int(protocol), 0, handle, seq) + data


def decode_legacy_payload(payload: bytes) -> tuple:
    """Returns (protocol, handle, seq, raw_data)."""
    protocol, _, handle, seq = struct.unpack_from("!BBHI", payload)
    return LegacyProtocol(protocol), handle, seq, payload[8:]


class LegacyConnection:
    """Represents a single legacy device connected to the bridge."""

    def __init__(
        self,
        conn_id:  str,
        reader:   asyncio.StreamReader,
        writer:   asyncio.StreamWriter,
        protocol: LegacyProtocol,
        session:  JumperSession,
    ):
        self.conn_id  = conn_id
        self.reader   = reader
        self.writer   = writer
        self.protocol = protocol
        self.session  = session
        self._seq     = 0
        self._handle  = 0x0001   # default GATT handle
        self._active  = True
        self.stats    = {"rx_bytes": 0, "tx_bytes": 0, "packets": 0}

    async def run(self):
        """Forward legacy TCP data → Jumper stream 0xB0."""
        while self._active:
            try:
                data = await asyncio.wait_for(self.reader.read(4096), timeout=30.0)
                if not data:
                    break

                self.stats["rx_bytes"]  += len(data)
                self.stats["packets"]   += 1

                payload = encode_legacy_payload(
                    self.protocol, self._handle, self._seq, data
                )
                self._seq = (self._seq + 1) & 0xFFFF_FFFF

                await self.session.send(StreamID.LEGACY, payload)
                logger.debug(
                    f"Bridge [{self.conn_id}] legacy→JMP {len(data)} B "
                    f"(proto={self.protocol.name})"
                )
            except asyncio.TimeoutError:
                continue
            except (ConnectionResetError, asyncio.IncompleteReadError):
                break
            except Exception as e:
                logger.error(f"Bridge [{self.conn_id}] error: {e}")
                break

        self._active = False
        try:
            self.writer.close()
            await self.writer.wait_closed()
        except Exception:
            pass
        logger.info(f"Bridge [{self.conn_id}] disconnected")

    async def send_to_legacy(self, data: bytes):
        """Send data from Jumper back to the legacy device."""
        if not self._active:
            return
        try:
            self.writer.write(data)
            await self.writer.drain()
            self.stats["tx_bytes"] += len(data)
        except Exception as e:
            logger.debug(f"Bridge [{self.conn_id}] send_to_legacy error: {e}")
            self._active = False


class JumperBridge:
    """
    TCP server that bridges legacy devices to a Jumper session.

    Usage::
        session = await device.connect(jumper_host_addr)
        bridge  = JumperBridge(session)
        await bridge.start()
        # Now legacy devices connect to TCP 127.0.0.1:55400

    Jumper → legacy:
        Register with  bridge.on_jumper_data(callback)
        or let the bridge auto-forward to the originating connection.
    """

    def __init__(
        self,
        session:  JumperSession,
        host:     str = BRIDGE_TCP_HOST,
        port:     int = BRIDGE_TCP_PORT,
        protocol: LegacyProtocol = LegacyProtocol.RAW_TCP,
    ):
        self.session   = session
        self.host      = host
        self.port      = port
        self.protocol  = protocol
        self._conns:   Dict[str, LegacyConnection] = {}
        self._server:  Optional[asyncio.AbstractServer] = None
        self._counter  = 0

    async def start(self):
        """Start listening for legacy connections."""
        await self.session.open_stream(StreamID.LEGACY)
        self.session.on_stream_data(StreamID.LEGACY, self._on_jumper_data)

        self._server = await asyncio.start_server(
            self._on_legacy_connect, self.host, self.port
        )
        logger.info(
            f"JumperBridge listening on {self.host}:{self.port} "
            f"(protocol={self.protocol.name})"
        )

    async def stop(self):
        if self._server:
            self._server.close()
            await self._server.wait_closed()
        for conn in list(self._conns.values()):
            conn._active = False

    async def _on_legacy_connect(
        self,
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter,
    ):
        self._counter += 1
        conn_id = f"legacy-{self._counter:04d}"
        addr    = writer.get_extra_info("peername")
        logger.info(f"Bridge: legacy device connected from {addr} → {conn_id}")

        conn = LegacyConnection(
            conn_id=conn_id,
            reader=reader,
            writer=writer,
            protocol=self.protocol,
            session=self.session,
        )
        self._conns[conn_id] = conn
        asyncio.create_task(conn.run(), name=f"bridge-{conn_id}")

    async def _on_jumper_data(self, _sid: int, payload: bytes):
        """Route Jumper 0xB0 data back to the appropriate legacy connection."""
        try:
            proto, handle, seq, raw = decode_legacy_payload(payload)
        except Exception:
            return

        # Broadcast to all legacy connections (in a real impl, route by handle)
        for conn in list(self._conns.values()):
            if conn._active:
                await conn.send_to_legacy(raw)

    def info(self) -> dict:
        return {
            "host":         self.host,
            "port":         self.port,
            "protocol":     self.protocol.name,
            "connections":  len(self._conns),
            "conn_stats":   {
                cid: c.stats for cid, c in self._conns.items()
            },
        }


# ── BLE GATT attribute bridge (simulation) ───────────────────────────────────

class GATTHandle:
    """Simulates a BLE GATT characteristic handle over Jumper."""

    def __init__(self, handle: int, uuid: str, session: JumperSession):
        self.handle  = handle
        self.uuid    = uuid
        self.session = session
        self._notify_cbs: list[Callable] = []

    async def write(self, data: bytes):
        """Write to GATT handle → sends over Jumper LEGACY stream."""
        payload = encode_legacy_payload(LegacyProtocol.BLE_GATT, self.handle, 0, data)
        await self.session.send(StreamID.LEGACY, payload)

    async def read(self, timeout: float = 2.0) -> bytes:
        """Read from GATT handle (single read with timeout)."""
        stream = self.session.streams.get(StreamID.LEGACY)
        if not stream:
            await self.session.open_stream(StreamID.LEGACY)
            stream = self.session.streams[StreamID.LEGACY]
        return await stream.recv(timeout=timeout)

    def on_notify(self, cb: Callable[[bytes], None]):
        self._notify_cbs.append(cb)
