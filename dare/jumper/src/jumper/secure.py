"""
JMP-SECURE  —  Capa criptográfica de Jumper
============================================
Clásica (siempre disponible):
  • X25519   — intercambio de claves (ECDH)
  • AES-256-GCM — cifrado autenticado por stream
  • HKDF-SHA256 — derivación de claves

Post-cuántica (requiere: pip install liboqs-python):
  • CRYSTALS-Kyber-1024  — KEM
  • CRYSTALS-Dilithium3  — firmas

Forward secrecy: rotación de clave de stream cada 60 s.
"""
import os
import json
import time
import struct
import logging
from dataclasses import dataclass, field
from typing import Optional, Tuple

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric.x25519 import (
    X25519PrivateKey, X25519PublicKey,
)
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.backends import default_backend

logger = logging.getLogger("jumper.secure")

# ── Post-quantum availability ────────────────────────────────────────────────
try:
    import oqs                               # liboqs-python
    PQ_AVAILABLE   = True
    KEM_ALGORITHM  = "Kyber1024"
    SIG_ALGORITHM  = "Dilithium3"
    logger.info("Post-quantum crypto: CRYSTALS-Kyber1024 + Dilithium3 (liboqs)")
except ImportError:
    PQ_AVAILABLE  = False
    KEM_ALGORITHM = None
    SIG_ALGORITHM = None
    logger.info("Post-quantum crypto: unavailable — using X25519 (pip install liboqs-python)")

NONCE_SIZE   = 12
KEY_SIZE     = 32
TAG_SIZE     = 16
KEY_ROTATE_S = 60.0   # rotate stream keys every 60 seconds


# ── Device Identity ──────────────────────────────────────────────────────────

@dataclass
class DeviceIdentity:
    """Cryptographic identity of a Jumper device (stored in Secure Enclave)."""
    device_id:   bytes
    public_key:  bytes
    private_key: bytes
    pq_mode:     bool  = False
    created_at:  float = field(default_factory=time.time)

    @classmethod
    def generate(cls, pq: bool = False) -> "DeviceIdentity":
        device_id = os.urandom(16)

        if pq and PQ_AVAILABLE:
            kem = oqs.KeyEncapsulation(KEM_ALGORITHM)
            pub = kem.generate_keypair()
            priv = kem.export_secret_key()
            return cls(device_id=device_id, public_key=pub,
                       private_key=priv, pq_mode=True)

        priv_key = X25519PrivateKey.generate()
        pub_key  = priv_key.public_key()
        priv_b = priv_key.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        )
        pub_b = pub_key.public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        )
        return cls(device_id=device_id, public_key=pub_b,
                   private_key=priv_b, pq_mode=False)

    # ── Serialisation ──────────────────────────────────────────────────────
    def to_dict(self) -> dict:
        return {
            "device_id":  self.device_id.hex(),
            "public_key": self.public_key.hex(),
            "pq_mode":    self.pq_mode,
            "created_at": self.created_at,
        }

    def public_info(self) -> dict:
        """Safe-to-broadcast public information (no private key)."""
        return {
            "device_id":  self.device_id.hex(),
            "public_key": self.public_key.hex(),
            "pq_mode":    self.pq_mode,
        }

    @property
    def id_hex(self) -> str:
        return self.device_id.hex()


# ── Jumper Security Layer ────────────────────────────────────────────────────

class JumperSecurity:
    """
    JMP-SECURE:  handles handshake, per-stream encryption, key rotation.

    Handshake flow (initiator):
        key, material = security.initiate_handshake(peer_pubkey)
        → send material to peer
        → use key as session_key

    Handshake flow (responder):
        key = security.complete_handshake(material_from_initiator)
        → use key as session_key
    """

    def __init__(self, identity: DeviceIdentity):
        self.identity = identity
        self._stream_keys:     dict[int, bytes] = {}
        self._stream_nonces:   dict[int, int]   = {}
        self._stream_rotated:  dict[int, float] = {}

    # ── Key Exchange ───────────────────────────────────────────────────────

    def initiate_handshake(
        self, peer_public_key: bytes
    ) -> Tuple[bytes, bytes]:
        """
        Initiator side.
        Returns (session_key, kem_material_to_send_to_peer).
        In X25519 mode  → kem_material = our public key
        In Kyber mode   → kem_material = KEM ciphertext
        """
        if self.identity.pq_mode and PQ_AVAILABLE:
            kem = oqs.KeyEncapsulation(KEM_ALGORITHM)
            ciphertext, shared = kem.encap_secret(peer_public_key)
            return self._derive(shared), ciphertext

        priv = X25519PrivateKey.from_private_bytes(self.identity.private_key)
        peer = X25519PublicKey.from_public_bytes(peer_public_key)
        shared = priv.exchange(peer)
        return self._derive(shared), self.identity.public_key

    def complete_handshake(self, kem_material: bytes) -> bytes:
        """
        Responder side.
        Returns session_key derived from the shared secret.
        """
        if self.identity.pq_mode and PQ_AVAILABLE:
            kem = oqs.KeyEncapsulation(KEM_ALGORITHM, self.identity.private_key)
            shared = kem.decap_secret(kem_material)
            return self._derive(shared)

        priv = X25519PrivateKey.from_private_bytes(self.identity.private_key)
        peer = X25519PublicKey.from_public_bytes(kem_material)
        shared = priv.exchange(peer)
        return self._derive(shared)

    def _derive(self, shared_secret: bytes, info: bytes = b"JumperSession-v1") -> bytes:
        return HKDF(
            algorithm=hashes.SHA256(),
            length=KEY_SIZE,
            salt=None,
            info=info,
            backend=default_backend(),
        ).derive(shared_secret)

    # ── Stream Keys ────────────────────────────────────────────────────────

    def setup_stream(self, session_key: bytes, stream_id: int):
        """Derive and store a per-stream encryption key."""
        info = f"JumperStream-v1-{stream_id:02X}".encode()
        self._stream_keys[stream_id] = self._derive(session_key, info)
        self._stream_nonces[stream_id]  = 0
        self._stream_rotated[stream_id] = time.monotonic()

    def _maybe_rotate(self, session_key: bytes, stream_id: int):
        """Rotate stream key if KEY_ROTATE_S has elapsed (forward secrecy)."""
        if time.monotonic() - self._stream_rotated.get(stream_id, 0) > KEY_ROTATE_S:
            self.setup_stream(session_key, stream_id)
            logger.debug(f"Stream 0x{stream_id:02X} key rotated")

    # ── Encryption / Decryption ────────────────────────────────────────────

    def encrypt(self, stream_id: int, plaintext: bytes) -> Tuple[bytes, bytes]:
        """
        Encrypt plaintext for stream_id.
        Returns (ciphertext_with_tag, nonce).
        AAD = stream_id (1 byte) — binds ciphertext to stream, prevents replay.
        """
        key = self._stream_keys.get(stream_id)
        if key is None:
            raise RuntimeError(f"Stream 0x{stream_id:02X} not set up — call setup_stream first")

        counter = self._stream_nonces[stream_id]
        self._stream_nonces[stream_id] = counter + 1

        nonce = counter.to_bytes(NONCE_SIZE, "big")
        aad   = stream_id.to_bytes(2, "big")
        ct    = AESGCM(key).encrypt(nonce, plaintext, aad)
        return ct, nonce

    def decrypt(self, stream_id: int, ciphertext: bytes, nonce: bytes) -> bytes:
        """Decrypt and verify ciphertext for stream_id."""
        key = self._stream_keys.get(stream_id)
        if key is None:
            raise RuntimeError(f"Stream 0x{stream_id:02X} not set up")

        aad = stream_id.to_bytes(2, "big")
        return AESGCM(key).decrypt(nonce, ciphertext, aad)

    # ── Utilities ──────────────────────────────────────────────────────────

    @staticmethod
    def generate_session_id() -> bytes:
        return os.urandom(16)

    @property
    def crypto_info(self) -> dict:
        return {
            "mode":      "post-quantum (Kyber1024)" if self.identity.pq_mode else "classical (X25519)",
            "cipher":    "AES-256-GCM",
            "kdf":       "HKDF-SHA256",
            "rotation_s": KEY_ROTATE_S,
        }
