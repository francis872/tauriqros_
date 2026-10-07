/**
 * Cognitive Overlay — Phase 11
 * Main container for the cognitive runtime overlay.
 * Reads from useRuntimeCoreStore and composes all sub-panels.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRuntimeCoreStore } from '../runtime/runtimeCoreStore'
import { HealingStatePanel } from './HealingStatePanel'
import { AgentActivityRadar } from './AgentActivityRadar'
import { InferenceTimeline } from './InferenceTimeline'
import { IntentGraphView } from './IntentGraphView'

export const CognitiveOverlay: React.FC = () => {
  const [open, setOpen] = useState(false)
  const snapshot = useRuntimeCoreStore((state) => state.coreSnapshot)

  if (!snapshot) return null

  const { agents, inference, processHealing, modelMesh, intentEngine } = snapshot as any

  // Only render the new panels if Phase 11 fields are present
  const hasPhase11 = !!processHealing && !!modelMesh && !!intentEngine

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-14 right-4 z-50 w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-white/20 transition-all flex items-center justify-center text-xs font-mono"
        title="Cognitive Overlay"
      >
        ⚙
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="cognitive-overlay"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-50 w-80 max-h-[70vh] overflow-y-auto space-y-3 pb-2"
          >
            {/* Always-visible agent activity */}
            <AgentActivityRadar
              agentCount={agents?.activeAgents ?? 0}
              supervisorActive={agents?.supervisorStatus === 'active'}
              continuityReady={!!agents?.continuity?.checkpointAge}
              proactiveHint={agents?.proactiveHint ?? ''}
            />

            {/* Phase 11 panels (conditional) */}
            {hasPhase11 && (
              <>
                <HealingStatePanel healing={processHealing} />
                <InferenceTimeline
                  activeModelId={modelMesh.activeModelId}
                  routingStrategy={modelMesh.routingStrategy}
                  meshEnabled={modelMesh.meshEnabled}
                  totalCapacityTps={modelMesh.mesh?.totalCapacityTps ?? 0}
                  queueDepth={inference?.queueDepth ?? 0}
                />
                <IntentGraphView intent={intentEngine} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
