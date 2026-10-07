/**
 * Healing State Panel — Phase 11
 * Displays the current self-healing supervisor status, active mitigations,
 * and stability score.
 */

import React from 'react'
import { motion } from 'framer-motion'
import type { ProcessHealingSnapshot } from '../runtime/healing/processRecoverySupervisor'
// eslint-disable-next-line @typescript-eslint/no-explicit-any

interface HealingStatePanelProps {
  healing: ProcessHealingSnapshot
}

const STATUS_COLOR: Record<string, string> = {
  healthy: 'text-green-400',
  monitoring: 'text-blue-400',
  recovering: 'text-yellow-400',
  degraded: 'text-orange-400',
  critical: 'text-red-400',
}

export const HealingStatePanel: React.FC<HealingStatePanelProps> = ({ healing }) => {
  const color = STATUS_COLOR[healing.supervisorStatus] ?? 'text-gray-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">Self-Healing Supervisor</span>
        <span className={`text-xs font-mono uppercase ${color}`}>{healing.supervisorStatus}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-lg font-bold text-white">
            {(healing.stability.overallScore * 100).toFixed(0)}
          </div>
          <div className="text-[10px] text-white/50 uppercase tracking-wide">Stability</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-lg font-bold text-white">
            {healing.repairs.completedCount}
          </div>
          <div className="text-[10px] text-white/50 uppercase tracking-wide">Repairs</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-lg font-bold text-white">
            {(healing.pressure.pressureScore * 100).toFixed(0)}
          </div>
          <div className="text-[10px] text-white/50 uppercase tracking-wide">Pressure</div>
        </div>
      </div>

      {healing.pressure.mitigations.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Active Mitigations</div>
          {healing.pressure.mitigations.map((m: string, i: number) => (
            <div key={i} className="text-xs text-white/60 pl-2 border-l border-yellow-500/40">{m}</div>
          ))}
        </div>
      )}

      {healing.repairs.actions.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Repair Actions</div>
          {healing.repairs.actions.slice(0, 3).map((a: { description: string; status: string }, i: number) => (
            <div key={i} className="text-xs text-white/60 flex justify-between">
              <span>{a.description}</span>
              <span className={a.status === 'completed' ? 'text-green-400' : 'text-orange-400'}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
