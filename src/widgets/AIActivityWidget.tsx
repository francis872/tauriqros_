import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { useSystemStats } from '../hooks/useSystemStats'

export default function AIActivityWidget() {
  const { aiActivity } = useSystemStats()
  const pulses = Array.from({ length: 20 })

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-emerald-400" />
          <span className="text-xs font-mono text-slate-400">AI Activity</span>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-1"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-mono text-emerald-400/70">{aiActivity}%</span>
        </motion.div>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-px h-10 overflow-hidden">
        {pulses.map((_, i) => {
          const h = Math.random() * 70 + 15
          return (
            <motion.div
              key={i}
              animate={{ scaleY: [0.3, 1, 0.3] }}
              transition={{
                duration: 0.8 + Math.random() * 0.8,
                delay: i * 0.05,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ height: `${h}%` }}
              className="flex-1 rounded-sm bg-emerald-500/40 origin-center"
            />
          )
        })}
      </div>
    </div>
  )
}
