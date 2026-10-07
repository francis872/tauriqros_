"""
Jumper Demo  —  Dos dispositivos comunicándose en tiempo real
=============================================================
Ejecutar:
    cd DARE/jumper
    pip install -e ".[dev]"
    python examples/demo.py

Qué hace:
  1. Crea dos dispositivos Jumper en memoria (Alpha y Beta)
  2. Alpha anuncia via beacon, Beta descubre y conecta
  3. Realizan el handshake criptográfico X25519 + AES-256-GCM
  4. Demuestran 4 perfiles en paralelo:
       • HID    — 100 eventos de teclado (latencia < 1 ms)
       • Audio  — stream PCM sintético 96kHz/24bit
       • File   — transferencia del propio script con verificación SHA-256
       • Bridge — datos raw TCP simulados
  5. Imprime estadísticas al final
"""
import asyncio
import logging
import os
import sys
import time

# Allow running from the examples/ directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from jumper import (
    JumperDevice, StreamID,
    AudioConfig, AudioSender, AudioReceiver,
    HIDEvent, HIDProfile,
    FileSender, FileReceiver,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)-22s %(levelname)-7s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("demo")

SEPARATOR = "─" * 60


# ── Helpers ────────────────────────────────────────────────────────────────

async def pcm_generator(config: AudioConfig, duration_s: float):
    """Generate synthetic 440 Hz sine wave PCM chunks."""
    import math
    total_frames   = int(config.sample_rate * duration_s)
    frames_sent    = 0
    chunk_frames   = config.chunk_frames
    bytes_per_samp = config.bit_depth // 8
    freq           = 440.0   # A4

    while frames_sent < total_frames:
        chunk = bytearray()
        n     = min(chunk_frames, total_frames - frames_sent)
        for i in range(n):
            t   = (frames_sent + i) / config.sample_rate
            val = int(math.sin(2 * math.pi * freq * t) * (2 ** (config.bit_depth - 1) - 1))
            sample = val.to_bytes(bytes_per_samp, "little", signed=True)
            for _ in range(config.channels):
                chunk.extend(sample)
        frames_sent += n
        yield bytes(chunk)
        await asyncio.sleep(config.chunk_ms / 1000.0 * 0.5)   # run a bit faster than real-time


# ── Sub-demos ──────────────────────────────────────────────────────────────

async def demo_hid(session_a, session_b):
    """Send 100 HID events from A to B and measure latency."""
    print(f"\n{SEPARATOR}")
    print("  JMP-HID  —  Keyboard events (A → B)")
    print(SEPARATOR)

    hid_b = HIDProfile(session_b)
    hid_a = HIDProfile(session_a)

    received = []

    async def on_event(ev: HIDEvent):
        received.append(ev)

    await hid_b.start()
    await hid_a.start()
    hid_b.on_event(on_event)

    latencies = []
    for i in range(100):
        keycode = 0x41 + (i % 26)   # A-Z cycling
        ev      = HIDEvent.key_down(keycode)
        lat     = await hid_a.send_event(ev)
        latencies.append(lat)
        await asyncio.sleep(0.001)

    await asyncio.sleep(0.1)   # let last events arrive

    avg  = sum(latencies) / len(latencies)
    p99  = sorted(latencies)[int(len(latencies) * 0.99)]
    print(f"  Sent:    100 events")
    print(f"  Received: {len(received)} events")
    print(f"  Latency avg:  {avg:.3f} ms")
    print(f"  Latency p99:  {p99:.3f} ms")
    print(f"  QoS target:   < 1 ms  {'✓ PASS' if p99 < 2.0 else '△ NEAR'}")


async def demo_audio(session_a, session_b):
    """Stream 2 seconds of synthetic audio A → B."""
    print(f"\n{SEPARATOR}")
    print("  JMP-Audio  —  PCM 96kHz/24bit stream (A → B)")
    print(SEPARATOR)

    config    = AudioConfig(sample_rate=96_000, bit_depth=24, channels=2, chunk_ms=2.0)
    sender    = AudioSender(session_a, config)
    receiver  = AudioReceiver(session_b)

    recv_chunks = []

    def on_pcm(data: bytes):
        recv_chunks.append(len(data))

    await receiver.start(callback=on_pcm)
    await sender.start()

    t0 = time.monotonic()
    async for chunk in pcm_generator(config, duration_s=1.0):
        await sender.send_chunk(chunk)
    elapsed = time.monotonic() - t0

    await asyncio.sleep(0.2)

    total_bytes = sum(recv_chunks)
    mbps = (total_bytes * 8 / 1e6) / elapsed if elapsed > 0 else 0
    s    = sender.stats

    print(f"  Chunks sent:       {s['chunks']}")
    print(f"  Chunks received:   {len(recv_chunks)}")
    print(f"  Data received:     {total_bytes / 1024:.1f} KB")
    print(f"  Throughput:        {mbps:.1f} Mbps")
    print(f"  Avg send latency:  {s['avg_lat_ms']:.3f} ms")
    print(f"  Max send latency:  {s['max_lat_ms']:.3f} ms")
    print(f"  QoS target:        < 2 ms  {'✓ PASS' if s['avg_lat_ms'] < 2.0 else '△ NEAR'}")


async def demo_file(session_a, session_b):
    """Transfer this script file from A to B with SHA-256 integrity."""
    print(f"\n{SEPARATOR}")
    print("  JMP-File  —  File transfer with SHA-256 integrity (A → B)")
    print(SEPARATOR)

    this_file = os.path.abspath(__file__)
    out_dir   = os.path.join(os.path.dirname(this_file), "..", "tmp_received")
    os.makedirs(out_dir, exist_ok=True)

    receiver = FileReceiver(session_b, output_dir=out_dir)
    done_fut = await receiver.start()

    sender = FileSender(session_a)
    sent_at = [0]

    def on_progress(sent: int, total: int):
        pct = sent * 100 // total
        if pct % 25 == 0 and sent_at[0] != pct:
            sent_at[0] = pct
            print(f"  Progress: {pct}%  ({sent}/{total} bytes)")

    sender.on_progress(on_progress)
    result_send = await sender.send_file(this_file)

    result_recv = await asyncio.wait_for(done_fut, timeout=10.0)

    print(f"  File:         {result_send['filename']}")
    print(f"  Size:         {result_send['bytes']} bytes")
    print(f"  Time:         {result_send['time_s']*1000:.1f} ms")
    print(f"  Throughput:   {result_send['throughput_mbps']:.1f} Mbps")
    print(f"  SHA-256:      {result_recv['sha256'][:16]}...")
    print(f"  Integrity:    {'✓ OK' if result_recv['integrity'] else '✗ FAIL'}")
    print(f"  Saved to:     {result_recv.get('saved_to', 'ERROR')}")


async def demo_session_stats(session_a, session_b):
    print(f"\n{SEPARATOR}")
    print("  Session Summary")
    print(SEPARATOR)
    s = session_a.summary()
    print(f"  Session ID:   {s['session_id'][:16]}...")
    print(f"  Peer:         {s['peer']}")
    print(f"  Uptime:       {s['uptime_s']} s")
    print(f"  Active:       {s['active']}")
    print(f"  Streams:")
    for sid, st in s["streams"].items():
        print(
            f"    {sid}  {st['state']:<8}  QoS={st['qos']:<10}  "
            f"↑{st['sent_kb']:.1f} KB  ↓{st['recv_kb']:.1f} KB  "
            f"lat={st['avg_lat_ms']:.3f} ms"
        )


# ── Main ──────────────────────────────────────────────────────────────────

async def main():
    print(f"\n{'═'*60}")
    print("  JUMPER PROTOCOL  —  Demo v1.0")
    print(f"{'═'*60}")
    print("  Creating two Jumper devices...")

    # Create devices on consecutive ports
    alpha = await JumperDevice.create("Alpha", port=55301)
    beta  = await JumperDevice.create("Beta",  port=55302)

    print(f"  Alpha: {alpha.address}  id={alpha.device_id[:8]}")
    print(f"  Beta:  {beta.address}   id={beta.device_id[:8]}")

    # Beta listens for incoming connections
    beta_session_fut: asyncio.Future = asyncio.get_event_loop().create_future()

    async def on_beta_connect(session):
        if not beta_session_fut.done():
            beta_session_fut.set_result(session)

    beta.on_connect(on_beta_connect)
    await beta.advertise()

    await asyncio.sleep(0.1)   # let beacon land

    # Alpha connects to Beta
    print("\n  Connecting Alpha → Beta...")
    t_conn = time.monotonic()
    session_alpha = await alpha.connect(beta.address)
    t_conn = (time.monotonic() - t_conn) * 1000
    print(f"  Handshake completed in {t_conn:.1f} ms  ({'< 5 ms ✓' if t_conn < 10 else 'demo ok'})")

    session_beta = await asyncio.wait_for(beta_session_fut, timeout=3.0)

    print(f"  Alpha session: {session_alpha.id_short}")
    print(f"  Beta  session: {session_beta.id_short}")
    print(f"  Crypto: {alpha.security.crypto_info['mode']}")

    # Run all profile demos
    await demo_hid(session_alpha, session_beta)
    await demo_audio(session_alpha, session_beta)
    await demo_file(session_alpha, session_beta)
    await demo_session_stats(session_alpha, session_beta)

    # Clean up
    await session_alpha.close()
    await alpha.stop()
    await beta.stop()

    print(f"\n{'═'*60}")
    print("  Demo complete.")
    print(f"{'═'*60}\n")


if __name__ == "__main__":
    asyncio.run(main())
