/**
 * Adaptive Snap Runtime — Phase 11
 * Dynamically adjusts snap behavior based on cognitive context,
 * GPU pressure, and window count. Prevents layout thrashing.
 */

import type { SnapLayoutId } from '../../windows/layoutTemplates'

export interface SnapAdaptationState {
  adaptationsEnabled: boolean
  currentLayout: SnapLayoutId | null
  recommendedLayout: SnapLayoutId | null
  layoutStability: 'stable' | 'recommended-change' | 'forced-change'
  adaptationReason: string
  lastAdaptedAt: number
  adaptationCount: number
}

let adaptationCount = 0

export function computeAdaptiveSnapState(input: {
  currentLayoutId: SnapLayoutId | null
  recommendedLayoutId: SnapLayoutId | null
  gpuPressure: boolean
  windowCount: number
  confidenceScore: number
}): SnapAdaptationState {
  const adaptationsEnabled = !input.gpuPressure && input.windowCount > 1

  let layoutStability: SnapAdaptationState['layoutStability'] = 'stable'
  let adaptationReason = 'Layout is optimal for current context'

  const shouldChange =
    input.recommendedLayoutId &&
    input.recommendedLayoutId !== input.currentLayoutId &&
    input.confidenceScore > 0.7

  if (shouldChange) {
    adaptationCount++
    layoutStability = 'recommended-change'
    adaptationReason = `Cognitive context suggests ${input.recommendedLayoutId} (confidence: ${(input.confidenceScore * 100).toFixed(0)}%)`
  }

  if (input.gpuPressure) {
    adaptationReason = 'Layout adaptation paused — GPU under pressure'
  }

  return {
    adaptationsEnabled,
    currentLayout: input.currentLayoutId,
    recommendedLayout: input.recommendedLayoutId,
    layoutStability,
    adaptationReason,
    lastAdaptedAt: shouldChange ? Date.now() : 0,
    adaptationCount,
  }
}
