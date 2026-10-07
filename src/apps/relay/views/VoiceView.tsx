import { useState } from 'react'
import { useRelayStore } from '../relayStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react'

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export default function VoiceView() {
  const { calls, agents } = useRelayStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)

  const activeCall = calls.find((c) => c.status === 'active')
  const history = calls.filter((c) => c.status !== 'active')
  const voiceAgent = agents.find((a) => a.type === 'voice')
  const selected = calls.find((c) => c.id === selectedId)

  const elapsed = activeCall ? Math.floor((Date.now() - activeCall.startedAt) / 1000) : 0

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Left panel */}
      <div className="flex w-64 flex-col border-r border-white/[0.06] flex-shrink-0">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <p className="text-xs font-semibold text-slate-400">Voice Infrastructure</p>
          <p className="text-[10px] text-slate-600 mt-0.5">{voiceAgent ? `${voiceAgent.name} · ${voiceAgent.status}` : 'No voice agent'}</p>
        </div>

        {/* Active call banner */}
        <AnimatePresence>
          {activeCall && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-3 mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-300">LIVE CALL</span>
              </div>
              <p className="text-xs font-semibold text-white">{activeCall.contact}</p>
              <p className="text-xl font-mono font-bold text-emerald-300 mt-1">{fmt(elapsed)}</p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  title={muted ? 'Unmute' : 'Mute'}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  onClick={() => setMuted((v) => !v)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold transition ${muted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'border border-white/[0.08] text-slate-400 hover:bg-white/[0.04]'}`}
                >
                  {muted ? <MicOff size={10} /> : <Mic size={10} />}
                  {muted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  type="button"
                  title="End call"
                  aria-label="End call"
                  className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-500/20 transition"
                >
                  <PhoneOff size={10} />
                  End
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call history */}
        <div className="border-b border-white/[0.06] px-4 py-2 mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Recent Calls</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {history.map((call) => (
            <button
              key={call.id}
              type="button"
              onClick={() => setSelectedId(call.id === selectedId ? null : call.id)}
              className={`flex w-full items-center gap-3 border-b border-white/[0.04] px-4 py-3 text-left hover:bg-white/[0.02] transition ${selectedId === call.id ? 'bg-violet-500/10' : ''}`}
            >
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${call.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                <Phone size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{call.contact}</p>
                <p className="text-[10px] text-slate-600">{fmt(call.duration)} · {timeAgo(call.startedAt)}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Voice stats */}
        <div className="border-t border-white/[0.06] p-3 grid grid-cols-2 gap-2">
          {[
            { label: 'Total Calls', value: calls.length },
            { label: 'Completed', value: calls.filter((c) => c.status === 'completed').length },
          ].map(({ label, value }) => (
            <div key={label} className="text-center rounded-lg border border-white/[0.06] bg-zinc-900/50 p-2">
              <p className="text-sm font-bold text-violet-300">{value}</p>
              <p className="text-[9px] text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: transcript / detail */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {selected ? (
          <div className="flex flex-1 flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">{selected.contact}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{fmt(selected.duration)} · {timeAgo(selected.startedAt)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${selected.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {selected.status}
              </span>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Transcription Summary</p>
              <p className="text-sm text-slate-300 leading-relaxed">{selected.transcript || 'No transcript available'}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Duration', value: fmt(selected.duration) },
                { label: 'Status', value: selected.status },
                { label: 'Handled by', value: voiceAgent?.name ?? 'Echo' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-center">
                  <p className="text-sm font-bold text-violet-300">{value}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-zinc-900 text-3xl">🎤</div>
            <p className="text-sm text-slate-500">Select a call to view transcript</p>
            {!activeCall && (
              <p className="text-xs text-slate-600">No active calls right now</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
