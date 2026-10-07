import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import { useSystemStats } from '../hooks/useSystemStats'
import { cn } from '../utils/cn'

export default function CPUWidget() {
  const { cpu } = useSystemStats()
  const bars = Array.from({ length: 12 })

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-sky-400" />
          <span className="text-xs font-mono text-slate-400">CPU</span>
        </div>
        <span className={cn(
          'text-sm font-bold font-mono',
          cpu > 80 ? 'text-red-400' : cpu > 60 ? 'text-amber-400' : 'text-sky-400'
        )}>
          {cpu}%
        </span>
      </div>
      {/* Bar graph */}
      <div className="flex items-end gap-0.5 h-10">
        {bars.map((_, i) => {
          const height = Math.random() * 80 + 20
          const active = (i / bars.length) * 100 <= cpu
          return (
            <motion.div
              key={i}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.8, delay: i * 0.03, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              className={cn(
                'flex-1 rounded-sm transition-colors duration-500',
                active ? 'bg-sky-500/60' : 'bg-white/[0.05]'
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
