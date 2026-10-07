/**
 * Behavioral Intent Engine — Phase 11
 * Main aggregator for the intent learning system.
 * Tracks signals, updates the habit graph, and exposes a runtime snapshot
 * that integrates into coreRuntimeOrchestrator.
 */

import {
  loadWorkflowHabitMemory,
  persistWorkflowHabitMemory,
} from './workflowHabitMemory'
import { recordHabitTransition } from './habitPatternGraph'
import {
  analyzeBehavior,
  type BehaviorSignal,
} from './contextBehaviorAnalyzer'
import { predictNextIntent, type IntentPrediction } from './predictiveIntentRuntime'

export type { BehaviorSignal }

export interface IntentEngineSnapshot {
  sessionSignalCount: number
  dominantPattern: string
  dominantAppId: string
  confidenceScore: number
  recoveryFrequency: number
  aiUsageRate: number
  focusDurationMs: number
  prediction: IntentPrediction
  topHabits: Array<{ appId: string; frequency: number }>
  lastUpdated: number
}

export function runBehavioralIntentEngine(input: {
  recentSignals: BehaviorSignal[]
  currentAppId?: string
}): IntentEngineSnapshot {
  const memory = loadWorkflowHabitMemory()

  // Record app-launch transitions into habit graph
  const launches = input.recentSignals.filter((s) => s.type === 'app-launch' && s.appId)
  for (let i = 0; i < launches.length - 1; i++) {
    const from = launches[i].appId!
    const to = launches[i + 1].appId!
    memory.graph = recordHabitTransition(memory.graph, from, to)
  }

  memory.sessionCount++
  memory.lastSessionAt = Date.now()
  persistWorkflowHabitMemory(memory)

  const analysis = analyzeBehavior(input.recentSignals, memory.graph)
  const prediction = predictNextIntent(memory.graph, analysis, input.currentAppId)

  const topHabits = [...memory.graph.nodes]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5)
    .map((n) => ({ appId: n.appId, frequency: n.frequency }))

  return {
    sessionSignalCount: input.recentSignals.length,
    dominantPattern: analysis.dominantPattern,
    dominantAppId: analysis.dominantAppId,
    confidenceScore: analysis.confidenceScore,
    recoveryFrequency: analysis.recoveryFrequency,
    aiUsageRate: analysis.aiUsageRate,
    focusDurationMs: analysis.focusDurationMs,
    prediction,
    topHabits,
    lastUpdated: Date.now(),
  }
}
