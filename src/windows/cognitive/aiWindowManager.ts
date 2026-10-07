/**
 * AI Window Manager — Phase 11
 * Main cognitive window orchestration system.
 * Combines focus layout, contextual placement, and adaptive snapping
 * into an autonomous window management snapshot.
 */

import { computeFocusLayout, type FocusLayoutRecommendation } from './focusLayoutEngine'
import { planWindowPlacements, type WindowPlacementPlan } from './contextualWindowPlacement'
import { computeAdaptiveSnapState, type SnapAdaptationState } from './adaptiveSnapRuntime'
import type { SnapLayoutId } from '../../windows/layoutTemplates'

export interface AiWindowOrchestratorSnapshot {
  focusLayout: FocusLayoutRecommendation
  placementPlan: WindowPlacementPlan
  snapAdaptation: SnapAdaptationState
  orchestrationActive: boolean
  managedWindowCount: number
  cognitiveMode: string
  updatedAt: number
}

export function orchestrateAiWindows(input: {
  openAppIds: string[]
  focusedAppId: string
  activeLayoutId: SnapLayoutId | null
  gpuUtil: number
  intentConfidenceScore: number
}): AiWindowOrchestratorSnapshot {
  const focusLayout = computeFocusLayout({
    focusedAppId: input.focusedAppId,
    openAppIds: input.openAppIds,
    activeLayoutId: input.activeLayoutId,
  })

  const placementPlan = planWindowPlacements({
    openAppIds: input.openAppIds,
    focusedAppId: input.focusedAppId,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
  })

  const snapAdaptation = computeAdaptiveSnapState({
    currentLayoutId: input.activeLayoutId,
    recommendedLayoutId: focusLayout.suggestedLayoutId,
    gpuPressure: input.gpuUtil > 85,
    windowCount: input.openAppIds.length,
    confidenceScore: input.intentConfidenceScore,
  })

  return {
    focusLayout,
    placementPlan,
    snapAdaptation,
    orchestrationActive: input.openAppIds.length > 0,
    managedWindowCount: input.openAppIds.length,
    cognitiveMode: focusLayout.cognitiveMode,
    updatedAt: Date.now(),
  }
}
