import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Bell, CloudSun } from 'lucide-react'
import { useSystemTime } from '../hooks/useSystemTime'
import type { EnvironmentWeather, UserIdentityProfile } from '../profiles/profileModels'
import type { TauriqSessionRuntimeSnapshot } from '../session/tauriqSessionManager'

interface TauriqLockScreenProps {
  open: boolean
  profile: UserIdentityProfile
  weather: EnvironmentWeather
  notifications: number
  runtimeSnapshot: TauriqSessionRuntimeSnapshot | null
  onUnlock: () => void
}

export default function TauriqLockScreen({
  open,
  profile,
  weather,
  notifications,
  runtimeSnapshot,
  onUnlock,
}: TauriqLockScreenProps) {
  const { formatted, date } = useSystemTime()
  const unfinishedWorkflowCount = runtimeSnapshot?.aiInsight.unfinishedWorkflowCount ?? 0
  const runtimeStatus = runtimeSnapshot?.core.runtime.status ?? 'guarded'
  const aiMode = runtimeSnapshot?.core.ai.mode ?? 'hybrid-fallback'
  const peers = runtimeSnapshot?.core.distributed.sync.peers ?? 0
  const activeAgents = runtimeSnapshot?.core.agents.health.activeAgents ?? 0

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/78 backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(48%_48%_at_50%_12%,rgba(34,211,238,0.2),transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(36%_44%_at_82%_86%,rgba(139,92,246,0.2),transparent_75%)]" />

          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="relative z-10 w-[420px] max-w-[92vw] rounded-3xl border border-cyan-200/20 bg-[#08101a]/78 p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.72)]"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10">
              <Lock size={20} className="text-cyan-100" />
            </div>

            <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300/80">TAURIQ Locked</p>
            <p className="mt-2 text-5xl font-semibold text-cyan-50">{formatted}</p>
            <p className="mt-1 font-mono text-sm text-slate-400">{date}</p>
            <p className="mt-4 text-sm text-slate-300">Session preserved for {profile.displayName}</p>
            <p className="mt-1 text-xs text-cyan-200/80">
              {unfinishedWorkflowCount > 0
                ? `${unfinishedWorkflowCount} unfinished workflows ready to resume.`
                : 'TAURIQ runtime initialized and waiting for unlock.'}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Runtime {runtimeStatus} · AI {aiMode}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Agents {activeAgents} · Mesh peers {peers}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 text-left">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Weather</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-cyan-100">
                  <CloudSun size={14} />
                  {weather.temperatureC}°C {weather.condition}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Notifications</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-cyan-100">
                  <Bell size={14} />
                  {notifications} waiting
                </p>
              </div>
            </div>

            <button
              onClick={onUnlock}
              className="mt-6 rounded-xl border border-cyan-300/35 bg-cyan-300/15 px-5 py-2.5 text-sm text-cyan-50 hover:bg-cyan-300/20"
              title="Unlock session"
            >
              Unlock Session
            </button>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
