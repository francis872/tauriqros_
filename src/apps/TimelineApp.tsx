import { motion } from 'framer-motion'
import { Clock3, GitBranch, Sparkles } from 'lucide-react'
import { useRuntimeCoreStore } from '../runtime/runtimeCoreStore'

export default function TimelineApp(_: { windowId: string }) {
  const coreSnapshot = useRuntimeCoreStore((state) => state.coreSnapshot)
  const timeline = coreSnapshot?.timeline.events ?? []

  return (
    <div className="h-full overflow-y-auto p-4 no-scrollbar">
      <div className="mb-3 flex items-center gap-2">
        <Clock3 size={13} className="text-cyan-300" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">Live Knowledge Timeline</p>
      </div>

      <div className="mb-4 rounded-xl border border-cyan-200/15 bg-cyan-300/[0.04] p-3">
        <p className="text-xs text-cyan-100">{coreSnapshot?.timeline.summary ?? 'Timeline runtime warming up.'}</p>
        {coreSnapshot && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            queue {coreSnapshot.nativeExecution.queue.depth} · retrieval {coreSnapshot.nativeExecution.retrieval.semanticHits.length} · tps {coreSnapshot.nativeExecution.tokenSummary.throughputTps}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {timeline.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GitBranch size={12} className="text-cyan-300/80" />
                <p className="text-sm text-slate-100">{event.label}</p>
              </div>
              <p className="font-mono text-[10px] text-slate-500">{new Date(event.at).toLocaleTimeString()}</p>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{event.cluster}</p>
          </motion.div>
        ))}

        {timeline.length === 0 && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-cyan-300/70" />
              Timeline has no semantic events yet.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
