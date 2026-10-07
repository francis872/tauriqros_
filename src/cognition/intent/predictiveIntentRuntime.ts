/**
 * Predictive Intent Runtime — Phase 11
 * Generates intent predictions from habit graph data and behavioral analysis.
 * Returns the most probable next app launch with probability and reasoning.
 */

import type { HabitPatternGraph } from './habitPatternGraph'
import { getTopNodes, getOutgoingEdges } from './habitPatternGraph'
import type { BehaviorAnalysis } from './contextBehaviorAnalyzer'

export interface IntentPrediction {
  nextAppId: string
  probability: number
  reasoning: string
  alternates: Array<{ appId: string; probability: number }>
  workspaceProbabilityMap: Record<string, number>
}

export function predictNextIntent(
  graph: HabitPatternGraph,
  _analysis: BehaviorAnalysis,
  currentAppId?: string,
): IntentPrediction {
  const workspaceProbabilityMap: Record<string, number> = {
    development: 0.35,
    research: 0.25,
    ai: 0.20,
    focus: 0.12,
    creative: 0.08,
  }

  // No data — bootstrap defaults
  if (!graph.nodes.length) {
    return {
      nextAppId: 'ai-app',
      probability: 0.42,
      reasoning: 'No behavioral data yet — defaulting to AI assistant as entry point',
      alternates: [
        { appId: 'monitor', probability: 0.28 },
        { appId: 'terminal', probability: 0.18 },
      ],
      workspaceProbabilityMap,
    }
  }

  // Follow outgoing edges from current app
  if (currentAppId) {
    const outgoing = getOutgoingEdges(graph, currentAppId)
    if (outgoing.length > 0) {
      const sorted = [...outgoing].sort((a, b) => b.transitionCount - a.transitionCount)
      const total = sorted.reduce((s, e) => s + e.transitionCount, 0)
      const top = sorted[0]
      const topAppId = top.target.replace('habit:', '')

      return {
        nextAppId: topAppId,
        probability: Number((top.transitionCount / total).toFixed(2)),
        reasoning: `Behavioral sequence: ${currentAppId} → ${topAppId} observed ${top.transitionCount} times`,
        alternates: sorted.slice(1, 3).map((e) => ({
          appId: e.target.replace('habit:', ''),
          probability: Number((e.transitionCount / total).toFixed(2)),
        })),
        workspaceProbabilityMap,
      }
    }
  }

  // Fall back to most frequent app overall
  const topNodes = getTopNodes(graph, 3)
  const top = topNodes[0]

  return {
    nextAppId: top.appId,
    probability: Number(Math.min(0.85, top.frequency * 0.08).toFixed(2)),
    reasoning: `Most frequently launched: ${top.label} (${top.frequency} times)`,
    alternates: topNodes.slice(1).map((n) => ({
      appId: n.appId,
      probability: Number(Math.min(0.7, n.frequency * 0.06).toFixed(2)),
    })),
    workspaceProbabilityMap,
  }
}
