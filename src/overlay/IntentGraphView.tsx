/**
 * Intent Graph View — Phase 11
 * Displays the user's behavioral intent graph: dominant patterns,
 * top habits, and predicted next actions.
 */

import React from 'react'
import { motion } from 'framer-motion'
import type { IntentEngineSnapshot } from '../cognition/intent/behavioralIntentEngine'

interface IntentGraphViewProps {
  intent: IntentEngineSnapshot
}

export const IntentGraphView: React.FC<IntentGraphViewProps> = ({ intent }) => {
  const confPct = Math.round(intent.confidenceScore * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">Intent Engine</span>
        <span className="text-xs text-white/40">{intent.sessionSignalCount} signals</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-white/40 text-[10px] uppercase">Pattern</div>
          <div className="text-white/90 mt-0.5">{intent.dominantPattern || 'learning…'}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-white/40 text-[10px] uppercase">Confidence</div>
          <div className={`font-mono mt-0.5 ${confPct > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
            {confPct}%
          </div>
        </div>
      </div>

      {intent.prediction && (
        <div className="rounded-lg bg-purple-500/10 border border-purple-400/20 p-2 space-y-1">
          <div className="text-[10px] text-purple-400/70 uppercase tracking-widest">Predicted Next</div>
          <div className="text-xs text-white/80">{intent.prediction.nextAppId}</div>
          <div className="text-[10px] text-white/40">{intent.prediction.reasoning}</div>
        </div>
      )}

      {intent.topHabits.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Top Habits</div>
          {intent.topHabits.slice(0, 3).map((h: { appId: string; frequency: number }, i: number) => (
            <div key={i} className="flex justify-between text-xs text-white/50">
              <span>{h.appId}</span>
              <span className="text-white/30">{h.frequency} times</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
