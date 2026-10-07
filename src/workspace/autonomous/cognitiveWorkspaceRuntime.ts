/**
 * Cognitive Workspace Runtime — Phase 11
 * Manages the active lifecycle of autonomously composed workspaces:
 * monitors continuity, triggers restoration, and adapts to context shifts.
 */

import type { WorkspaceSpec } from './contextWorkspaceBuilder'
import type { SessionFlowPrediction } from './sessionFlowPredictor'

export interface CognitiveWorkspaceState {
  activeWorkspaceId: string
  spec: WorkspaceSpec
  sessionFlow: SessionFlowPrediction
  continuityScore: number
  adapterMode: 'stable' | 'transitioning' | 'restoring' | 'predicting'
  lastAdaptedAt: number
  autonomousActionsCount: number
}

export function runCognitiveWorkspaceRuntime(input: {
  workspaceId: string
  spec: WorkspaceSpec
  sessionFlow: SessionFlowPrediction
  anomalyCount: number
}): CognitiveWorkspaceState {
  const continuityScore = Number(
    Math.min(0.99, input.sessionFlow.confidence * 0.6 + input.spec.estimatedProductivityScore * 0.4).toFixed(2),
  )

  let adapterMode: CognitiveWorkspaceState['adapterMode'] = 'stable'
  if (input.anomalyCount > 3) adapterMode = 'restoring'
  else if (input.sessionFlow.confidence < 0.5) adapterMode = 'predicting'
  else if (continuityScore < 0.6) adapterMode = 'transitioning'

  return {
    activeWorkspaceId: input.workspaceId,
    spec: input.spec,
    sessionFlow: input.sessionFlow,
    continuityScore,
    adapterMode,
    lastAdaptedAt: Date.now(),
    autonomousActionsCount: input.spec.suggestedApps.length,
  }
}
