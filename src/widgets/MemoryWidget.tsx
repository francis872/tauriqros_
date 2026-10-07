import { motion } from 'framer-motion'
import { Database } from 'lucide-react'
import { useSystemStats } from '../hooks/useSystemStats'
import { cn } from '../utils/cn'

export default function MemoryWidget() {
  const { memory } = useSystemStats()

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-violet-400" />
          <span className="text-xs font-mono text-slate-400">Memory</span>
        </div>
        <span className={cn(
          'text-sm font-bold font-mono',
          memory > 80 ? 'text-red-400' : memory > 60 ? 'text-amber-400' : 'text-violet-400'
        )}>
          {memory}%
        </span>
      </div>

      {/* Radial progress */}
      <div className="relative w-16 h-16 mx-auto">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <motion.circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke="url(#memGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={100.5}
            animate={{ strokeDashoffset: 100.5 - (100.5 * memory) / 100 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="memGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-mono text-slate-400">{memory}%</span>
        </div>
      </div>
    </div>
  )
}
