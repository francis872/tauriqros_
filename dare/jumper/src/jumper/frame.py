"""
JMP-FRAME  —  Formato de trama binario de Jumper
================================================
Estructura de cabecera (32 bytes fijos):

  Offset  Size  Field
  ------  ----  -----
   0      4     MAGIC  = 0x4A4D5052  ("JMPR")
   4      1     VERSION
   5      1     FRAME_TYPE
   6      1     FLAGS
   7      1     PHY_MODE
   8      2     STREAM_ID
  10      2     SEQUENCE
  12     16     SESSION_ID
  28      4     PAYLOAD_LEN
  32      N     PAYLOAD
  32+N   16     AES-GCM AUTH TAG (zeros for unencrypted control frames)
"""
import struct
from dataclasses import dataclass, field
from enum import IntEnum

JUMPER_MAGIC       = 0x4A4D5052   # "JMPR"
JUMPER_VERSION     = 1
FRAME_HEADER_FMT   = "!IBBBBHH16sI"
FRAME_HEADER_SIZE  = struct.calcsize(FRAME_HEADER_FMT)   # 32 bytes
FRAME_TAG_SIZE     = 16


class FrameType(IntEnum):
    # Discovery
    BEACON        = 0x01
    HELLO         = 0x02
    # Handshake
    KEM_INIT      = 0x10
    KEM_RESP      = 0x11
    MODE_NEG      = 0x12
    MODE_ACK      = 0x13
    # Data
    DATA          = 0x20
    ACK           = 0x21
    NACK          = 0x22
    # Session control
    KEEPALIVE     = 0x30
    DISCONNECT    = 0x31
    STREAM_OPEN   = 0x40
    STREAM_CLOSE  = 0x41


class StreamID(IntEnum):
    CONTROL = 0x00
    HID     = 0x01
    AUDIO   = 0x02
    VIDEO   = 0x03
    FILE    = 0x04
    LEGACY  = 0xB0   # Bridge: legacy BT/WiFi-Direct traffic
    CUSTOM  = 0xFF


class PHYMode(IntEnum):
    AUTO = 0
    UWB  = 1   # 3.1–10.6 GHz  |  500 Mbps  |  10–30 m   |  <0.5 mW
    MMW  = 2   # 57–71 GHz     |  7 Gbps    |  0.1–5 m   |  50 mW
    SUB6 = 3   # 5.8 GHz ISM   |  200 Mbps  |  5–80 m    |  20 mW


class FrameFlags(IntEnum):
    NONE      = 0x00
    ENCRYPTED = 0x01
    RELIABLE  = 0x02   # ACK requested
    URGENT    = 0x04   # Real-time / HID priority


PHY_PROFILES: dict[PHYMode, dict] = {
    PHYMode.UWB:  {"max_mbps": 500,  "max_range_m": 30, "latency_ms": 0.5, "tx_mw": 0.5},
    PHYMode.MMW:  {"max_mbps": 7000, "max_range_m": 5,  "latency_ms": 0.3, "tx_mw": 50},
    PHYMode.SUB6: {"max_mbps": 200,  "max_range_m": 80, "latency_ms": 1.0, "tx_mw": 20},
}


def select_phy(distance_m: float, use_case: str) -> PHYMode:
    """Auto-selects the best PHY mode given distance and use-case."""
    if distance_m <= 5 and use_case in ("video", "file", "screen"):
        return PHYMode.MMW
    if distance_m <= 30 and use_case in ("hid", "audio", "iot", "control"):
        return PHYMode.UWB
    return PHYMode.SUB6


@dataclass
class JumperFrame:
    frame_type: FrameType
    flags:      int      = FrameFlags.NONE
    phy_mode:   PHYMode  = PHYMode.UWB
    stream_id:  int      = StreamID.CONTROL
    sequence:   int      = 0
    session_id: bytes    = field(default_factory=lambda: b"\x00" * 16)
    payload:    bytes    = b""
    tag:        bytes    = field(default_factory=lambda: b"\x00" * FRAME_TAG_SIZE)

    # ── Encoding ────────────────────────────────────────────────────────────
    def encode(self) -> bytes:
        header = struct.pack(
            FRAME_HEADER_FMT,
            JUMPER_MAGIC,
            JUMPER_VERSION,
            int(self.frame_type),
            self.flags,
            int(self.phy_mode),
            self.stream_id,
            self.sequence,
            self.session_id,
            len(self.payload),
        )
        return header + self.payload + self.tag

    # ── Decoding ────────────────────────────────────────────────────────────
    @classmethod
    def decode(cls, data: bytes) -> "JumperFrame":
        if len(data) < FRAME_HEADER_SIZE + FRAME_TAG_SIZE:
            raise ValueError(f"Frame too short ({len(data)} bytes)")

        magic, version, ftype, flags, phy, stream_id, seq, session_id, plen = struct.unpack(
            FRAME_HEADER_FMT, data[:FRAME_HEADER_SIZE]
        )

        if magic != JUMPER_MAGIC:
            raise ValueError(f"Bad magic 0x{magic:08X}")
        if version != JUMPER_VERSION:
            raise ValueError(f"Unsupported version {version}")

        pstart = FRAME_HEADER_SIZE
        pend   = pstart + plen
        tend   = pend + FRAME_TAG_SIZE

        if len(data) < tend:
            raise ValueError("Frame truncated in payload/tag")

        return cls(
            frame_type=FrameType(ftype),
            flags=flags,
            phy_mode=PHYMode(phy),
            stream_id=stream_id,
            sequence=seq,
            session_id=session_id,
            payload=data[pstart:pend],
            tag=data[pend:tend],
        )

    def __len__(self) -> int:
        return FRAME_HEADER_SIZE + len(self.payload) + FRAME_TAG_SIZE

    def __repr__(self) -> str:
        return (
            f"<JumperFrame type={self.frame_type.name} stream=0x{self.stream_id:02X} "
            f"seq={self.sequence} payload={len(self.payload)}B "
            f"session={self.session_id.hex()[:8]}>"
        )
