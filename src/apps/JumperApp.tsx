import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Wifi, ChevronRight, ShieldCheck, Activity } from 'lucide-react'

type JumperView = 'overview' | 'devices' | 'streams' | 'security'

const NAV: { id: JumperView; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'overview',  label: 'Overview',  Icon: Radio },
  { id: 'devices',   label: 'Devices',   Icon: Wifi },
  { id: 'streams',   label: 'Streams',   Icon: Activity },
  { id: 'security',  label: 'Security',  Icon: ShieldCheck },
]

const PHY_MODES = [
  { name: 'JMP-UWB',  band: '3.1–10.6 GHz', speed: '500 Mbps',  range: '30 m',  power: '0.5 mW', color: 'sky' },
  { name: 'JMP-mmW',  band: '57–71 GHz',     speed: '7 Gbps',    range: '5 m',   power: '50 mW',  color: 'violet' },
  { name: 'JMP-Sub6', band: '5.8 GHz ISM',   speed: '200 Mbps',  range: '80 m',  power: '20 mW',  color: 'emerald' },
]

const DEMO_DEVICES = [
  { id: 'alpha', name: 'Alpha Node',    mode: 'JMP-UWB',  status: 'connected', rssi: -42, streams: 3 },
  { id: 'beta',  name: 'Beta Node',     mode: 'JMP-UWB',  status: 'connected', rssi: -38, streams: 3 },
  { id: 'hid1',  name: 'JMP Keyboard',  mode: 'JMP-UWB',  status: 'connected', rssi: -55, streams: 1 },
  { id: 'spk1',  name: 'JMP Speaker',   mode: 'JMP-Sub6', status: 'connected', rssi: -61, streams: 1 },
  { id: 'dock1', name: 'JMP Dock',      mode: 'JMP-mmW',  status: 'idle',      rssi: -30, streams: 0 },
]

const DEMO_STREAMS = [
  { id: '0x00', type: 'CONTROL', qos: 'REAL_TIME', latency: '0.4 ms', tx: '0.1 KB',   rx: '0.1 KB',   color: 'cyan' },
  { id: '0x01', type: 'HID',     qos: 'REAL_TIME', latency: '0.9 ms', tx: '1.1 KB',   rx: '0.0 KB',   color: 'sky' },
  { id: '0x02', type: 'AUDIO',   qos: 'AUDIO',     latency: '1.8 ms', tx: '568.9 KB', rx: '0.0 KB',   color: 'violet' },
  { id: '0x04', type: 'FILE',    qos: 'BULK',      latency: '0.4 ms', tx: '9.4 KB',   rx: '9.4 KB',   color: 'emerald' },
]

const MODE_COLOR: Record<string, string> = {
  sky:     'border-sky-500/30 bg-sky-500/10 text-sky-300',
  violet:  'border-violet-500/30 bg-violet-500/10 text-violet-300',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  cyan:    'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
}

export default function JumperApp(_: { windowId: string }) {
  const [view, setView] = useState<JumperView>('overview')

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] bg-zinc-950/90 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-600">
            <Radio size={12} className="text-white" />
          </div>
          <span className="text-xs font-bold tracking-widest text-white uppercase">Jumper</span>
        </div>

        <nav className="flex items-center gap-0.5 flex-1">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setView(id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                view === id
                  ? 'bg-sky-600/20 text-sky-300 ring-1 ring-sky-500/40'
                  : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          PROTOCOL ACTIVE
        </div>
      </header>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
          className="flex-1 overflow-y-auto p-4 no-scrollbar"
        >
          {view === 'overview'  && <OverviewView />}
          {view === 'devices'   && <DevicesView />}
          {view === 'streams'   && <StreamsView />}
          {view === 'security'  && <SecurityView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Overview ──────────────────────────────────────────────────────────────────

function OverviewView() {
  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Devices',    value: '5',       sub: '5 connected',    color: 'sky' },
          { label: 'Streams',    value: '4',        sub: 'active',         color: 'violet' },
          { label: 'Throughput', value: '62.6 Mbps', sub: 'aggregate',     color: 'emerald' },
          { label: 'Avg Latency', value: '0.9 ms', sub: 'HID stream',      color: 'cyan' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{s.label}</p>
            <p className={`mt-1 text-lg font-bold text-${s.color}-300`}>{s.value}</p>
            <p className="text-[10px] text-slate-600">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* PHY Modes */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
        <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-slate-600">PHY Modes</p>
        <div className="space-y-2">
          {PHY_MODES.map((m, i) => (
            <div key={m.name} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] ${MODE_COLOR[m.color]}`}>{m.name}</span>
              <span className="font-mono text-[10px] text-slate-500">{m.band}</span>
              <span className="font-mono text-[10px] text-slate-400">{m.speed}</span>
              <span className="text-[10px] text-slate-600">{m.range}</span>
              <span className="ml-auto text-[10px] text-slate-600">{m.power}</span>
              {i === 0 && <span className="rounded-full bg-sky-500/20 px-1.5 py-0.5 text-[9px] text-sky-300">ACTIVE</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Last demo result */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-emerald-500/70">Last Demo Run</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ['Handshake X25519', '187 ms'],
            ['HID Events', '100/100 ✓'],
            ['Audio PCM 96kHz/24bit', '500/500 chunks ✓'],
            ['File Transfer SHA-256', '62.6 Mbps · OK ✓'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2 py-1.5">
              <span className="text-slate-500">{k}</span>
              <span className="font-mono text-emerald-400">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Devices ───────────────────────────────────────────────────────────────────

function DevicesView() {
  return (
    <div className="space-y-2">
      <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-slate-600">Connected Devices</p>
      {DEMO_DEVICES.map(dev => (
        <div key={dev.id} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
          <div className={`h-2 w-2 rounded-full ${dev.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-200">{dev.name}</p>
            <p className="text-[10px] font-mono text-slate-600">{dev.id} · RSSI {dev.rssi} dBm</p>
          </div>
          <span className="font-mono text-[10px] text-sky-400">{dev.mode}</span>
          <div className="text-right">
            <p className="text-[10px] text-slate-500">{dev.streams} stream{dev.streams !== 1 ? 's' : ''}</p>
            <p className={`text-[10px] font-mono ${dev.status === 'connected' ? 'text-emerald-400' : 'text-slate-600'}`}>{dev.status}</p>
          </div>
          <ChevronRight size={14} className="text-slate-700" />
        </div>
      ))}
    </div>
  )
}

// ── Streams ───────────────────────────────────────────────────────────────────

function StreamsView() {
  return (
    <div className="space-y-2">
      <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-slate-600">Active Streams — Session 7ae0d957</p>
      {DEMO_STREAMS.map(s => (
        <div key={s.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${MODE_COLOR[s.color]}`}>{s.id}</span>
            <span className="text-sm font-medium text-slate-200">{s.type}</span>
            <span className={`rounded-full border px-1.5 py-0.5 text-[9px] ${MODE_COLOR[s.color]}`}>{s.qos}</span>
            <span className="ml-auto font-mono text-[10px] text-slate-400">lat {s.latency}</span>
          </div>
          <div className="mt-2 flex gap-4 font-mono text-[10px] text-slate-600">
            <span>↑ {s.tx}</span>
            <span>↓ {s.rx}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Security ──────────────────────────────────────────────────────────────────

function SecurityView() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-sky-400" />
          <p className="text-sm font-semibold text-sky-200">JMP-SECURE Layer</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['Key Exchange',    'X25519 (ECDH)'],
            ['Cipher',          'AES-256-GCM'],
            ['KDF',             'HKDF-SHA256'],
            ['Key Rotation',    'Every 60 s (forward secrecy)'],
            ['Post-Quantum',    'Kyber-1024 (when liboqs installed)'],
            ['Signatures',      'Dilithium-3 (when liboqs installed)'],
            ['Pairing',         'Tap-to-pair (UWB < 10 cm)'],
            ['PIN',             'None — proximity auth'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{k}</p>
              <p className="mt-0.5 text-xs text-slate-300">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
        <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-slate-600">Session Key Status</p>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-300">Session 7ae0d957 — AES-256-GCM active</span>
        </div>
        <p className="mt-2 font-mono text-[10px] text-slate-600">Next rotation in ~42 s · 4 stream keys active</p>
      </div>
    </div>
  )
}
