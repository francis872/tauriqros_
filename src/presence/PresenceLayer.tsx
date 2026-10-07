import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { PresenceInsight } from '../intelligence/workspaceIntelligence'

interface PresenceLayerProps {
  open: boolean
  insights: PresenceInsight[]
  onDismiss: () => void
}

const TONE_CLASS: Record<PresenceInsight['tone'], string> = {
  info: 'border-cyan-200/20 text-cyan-100',
  focus: 'border-violet-200/20 text-violet-100',
  alert: 'border-amber-200/25 text-amber-100',
}

export default function PresenceLayer({ open, insights, onDismiss }: PresenceLayerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-24 right-5 z-30 w-[360px] rounded-2xl border border-cyan-200/20 bg-[#0b1119]/85 p-4 backdrop-blur-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-300" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-200">TAURIQ Presence</p>
            </div>
            <button
              onClick={onDismiss}
              className="rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] text-slate-400 hover:text-cyan-100"
              title="Dismiss presence"
            >
              Hide
            </button>
          </div>

          <div className="space-y-2">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`rounded-lg border bg-white/[0.03] px-3 py-2 text-sm ${TONE_CLASS[insight.tone]}`}
              >
                {insight.label}
              </div>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
