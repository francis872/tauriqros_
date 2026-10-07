import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import type { RuntimeNotification } from './notificationModels'
import type { TauriqSessionRuntimeSnapshot } from '../session/tauriqSessionManager'

interface NotificationOverlayProps {
  open: boolean
  notifications: RuntimeNotification[]
  unreadCount: number
  onMarkAllRead: () => void
  runtimeSnapshot: TauriqSessionRuntimeSnapshot | null
}

const TONE_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
} as const

export default function NotificationOverlay({
  open,
  notifications,
  unreadCount,
  onMarkAllRead,
  runtimeSnapshot,
}: NotificationOverlayProps) {
  const anomalies = runtimeSnapshot?.core.healing.anomalies.length ?? 0
  const peers = runtimeSnapshot?.core.distributed.peers.length ?? 0
  const queueDepth = runtimeSnapshot?.core.aiRuntime.queueDepth ?? 0
  const plannerNext = runtimeSnapshot?.core.planning.recommendedNext ?? 'Planner idle'
  const predictivePrompt = runtimeSnapshot?.core.predictiveWorkspace.prompt ?? 'Predictive context unavailable'
  const tokenThroughput = runtimeSnapshot?.core.nativeExecution.tokenSummary.throughputTps ?? 0
  const retrievalHits = runtimeSnapshot?.core.nativeExecution.retrieval.semanticHits.length ?? 0

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          className="absolute right-5 top-5 z-30 w-[340px] rounded-2xl border border-cyan-200/15 bg-[#0c111a]/90 p-4 backdrop-blur-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-cyan-200" />
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-200">Intelligent Alerts</p>
            </div>
            <button
              onClick={onMarkAllRead}
              className="rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] text-slate-400 hover:text-cyan-100"
              title="Mark all read"
            >
              Mark read ({unreadCount})
            </button>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">AI Queue</p>
              <p className="text-xs text-cyan-100">{queueDepth}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">Mesh Peers</p>
              <p className="text-xs text-cyan-100">{peers}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">Healing</p>
              <p className="text-xs text-cyan-100">{anomalies === 0 ? 'stable' : `${anomalies} alerts`}</p>
            </div>
          </div>

          <div className="mb-3 rounded-lg border border-cyan-200/15 bg-cyan-300/[0.04] px-2.5 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-300/80">Proactive Recovery Prompt</p>
            <p className="mt-1 text-xs text-cyan-100">{predictivePrompt}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">next: {plannerNext}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">tps: {tokenThroughput} · retrieval: {retrievalHits}</p>
          </div>

          <div className="space-y-2">
            {notifications.slice(0, 6).map((notification) => {
              const Icon = TONE_ICON[notification.tone]
              return (
                <div
                  key={notification.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={13} className="text-cyan-300" />
                    <p className="text-sm text-cyan-50">{notification.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{notification.message}</p>
                </div>
              )
            })}

            {notifications.length === 0 && (
              <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
                No contextual notifications queued.
              </p>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
