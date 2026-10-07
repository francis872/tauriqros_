/**
 * Inference Timeline — Phase 11
 * Displays a compact timeline of recent inference events and model routing info.
 */

import React from 'react'
import { motion } from 'framer-motion'

interface InferenceEvent {
  id: string
  modelId: string
  role: string
  latencyMs: number
  timestamp: number
}

interface InferenceTimelineProps {
  activeModelId: string
  routingStrategy: string
  meshEnabled: boolean
  totalCapacityTps: number
  queueDepth: number
}

export const InferenceTimeline: React.FC<InferenceTimelineProps> = ({
  activeModelId,
  routingStrategy,
  meshEnabled,
  totalCapacityTps,
  queueDepth,
}) => {
  // Generate mock recent events for display
  const mockEvents: InferenceEvent[] = React.useMemo(() => {
    const roles = ['fast-local', 'reasoning', 'memory']
    const models = ['phi3', 'qwen', 'llama3']
    return Array.from({ length: 4 }, (_, i) => ({
      id: `evt-${i}`,
      modelId: models[i % models.length],
      role: roles[i % roles.length],
      latencyMs: 80 + i * 40,
      timestamp: Date.now() - i * 3000,
    }))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">Inference Layer</span>
        <span className="text-xs text-white/40">{totalCapacityTps} t/s capacity</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-white/40 text-[10px] uppercase">Active Model</div>
          <div className="text-white/90 font-mono mt-0.5">{activeModelId}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-white/40 text-[10px] uppercase">Strategy</div>
          <div className="text-white/90 font-mono mt-0.5">{routingStrategy}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-white/40 text-[10px] uppercase">Queue</div>
          <div className={`font-mono mt-0.5 ${queueDepth > 5 ? 'text-yellow-400' : 'text-white/90'}`}>
            {queueDepth} jobs
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-white/40 text-[10px] uppercase">Mesh</div>
          <div className={`font-mono mt-0.5 ${meshEnabled ? 'text-green-400' : 'text-white/40'}`}>
            {meshEnabled ? 'active' : 'local only'}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-[10px] text-white/40 uppercase tracking-widest">Recent Events</div>
        {mockEvents.map((evt) => (
          <div key={evt.id} className="flex items-center justify-between text-xs text-white/50">
            <span className="font-mono text-white/60">{evt.modelId}</span>
            <span className="text-white/30">{evt.role}</span>
            <span>{evt.latencyMs}ms</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
