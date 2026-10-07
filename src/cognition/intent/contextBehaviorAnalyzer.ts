/**
 * Context Behavior Analyzer — Phase 11
 * Analyzes recent behavioral signals to identify dominant patterns,
 * confidence scores, and contextual recommendations.
 */

import type { HabitPatternGraph } from './habitPatternGraph'
import { getTopNodes } from './habitPatternGraph'

export type BehaviorSignalType =
  | 'app-launch'
  | 'layout-change'
  | 'workspace-switch'
  | 'ai-query'
  | 'recovery-trigger'
  | 'snap-apply'
  | 'window-close'

export interface BehaviorSignal {
  type: BehaviorSignalType
  appId?: string
  layoutId?: string
  workspaceId?: string
  timestamp: number
}

export interface BehaviorAnalysis {
  dominantPattern: string
  dominantAppId: string
  recentSignals: BehaviorSignal[]
  confidenceScore: number
  suggestedContext: string
  recoveryFrequency: number
  aiUsageRate: number
  focusDurationMs: number
}

export function analyzeBehavior(
  signals: BehaviorSignal[],
  graph: HabitPatternGraph,
): BehaviorAnalysis {
  const recent = signals.slice(-20)
  const appLaunches = recent.filter((s) => s.type === 'app-launch')
  const recoveries = recent.filter((s) => s.type === 'recovery-trigger')
  const aiQueries = recent.filter((s) => s.type === 'ai-query')

  const dominantAppId =
    appLaunches.length > 0
      ? (appLaunches[appLaunches.length - 1]?.appId ?? 'unknown')
      : 'idle'

  const topNodes = getTopNodes(graph, 3)
  const dominantPattern = topNodes[0]?.label ?? dominantAppId

  // Confidence grows with behavioral data richness
  const dataPoints = graph.nodes.length + graph.edges.length + appLaunches.length
  const confidenceScore = Number(Math.min(0.97, dataPoints * 0.04).toFixed(2))

  const suggestedContext = topNodes[0]?.contextTags[0] ?? 'development'

  // Estimate focus duration: gap between first and last signal
  const focusDurationMs =
    recent.length >= 2
      ? (recent[recent.length - 1]?.timestamp ?? 0) - (recent[0]?.timestamp ?? 0)
      : 0

  return {
    dominantPattern,
    dominantAppId,
    recentSignals: recent,
    confidenceScore,
    suggestedContext,
    recoveryFrequency: recoveries.length,
    aiUsageRate: recent.length > 0 ? aiQueries.length / recent.length : 0,
    focusDurationMs,
  }
}
