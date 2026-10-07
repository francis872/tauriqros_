/**
 * Agent Activity Radar — Phase 11
 * Visualizes active agents, their health, and current tasks.
 */

import React from 'react'
import { motion } from 'framer-motion'

interface AgentSlot {
  id: string
  label: string
  active: boolean
  taskCount: number
}

interface AgentActivityRadarProps {
  agentCount: number
  supervisorActive: boolean
  continuityReady: boolean
  proactiveHint: string
}

export const AgentActivityRadar: React.FC<AgentActivityRadarProps> = ({
  agentCount,
  supervisorActive,
  continuityReady,
  proactiveHint,
}) => {
  const agents: AgentSlot[] = [
    { id: 'supervisor', label: 'Supervisor', active: supervisorActive, taskCount: agentCount },
    { id: 'continuity', label: 'Continuity', active: continuityReady, taskCount: continuityReady ? 1 : 0 },
    { id: 'proactive', label: 'Proactive', active: !!proactiveHint, taskCount: proactiveHint ? 1 : 0 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">Agent Activity</span>
        <span className="text-xs text-white/40">{agentCount} active</span>
      </div>

      <div className="space-y-2">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center gap-2">
            <motion.div
              className={`w-2 h-2 rounded-full ${agent.active ? 'bg-green-400' : 'bg-white/20'}`}
              animate={agent.active ? { opacity: [1, 0.4, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs text-white/70 flex-1">{agent.label}</span>
            <span className="text-xs text-white/40">{agent.taskCount} tasks</span>
          </div>
        ))}
      </div>

      {proactiveHint && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-400/20 p-2">
          <div className="text-[10px] text-blue-400/70 uppercase tracking-widest mb-1">Proactive Insight</div>
          <div className="text-xs text-white/70">{proactiveHint}</div>
        </div>
      )}
    </motion.div>
  )
}
