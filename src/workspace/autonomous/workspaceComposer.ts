/**
 * Workspace Composer — Phase 11
 * Main aggregator for autonomous workspace composition.
 * Combines context building, session flow prediction, restoration planning,
 * and cognitive workspace runtime into a single snapshot.
 */

import { buildContextWorkspace, type WorkspaceSpec } from './contextWorkspaceBuilder'
import { predictSessionFlow, type SessionFlowPrediction } from './sessionFlowPredictor'
import {
  buildRestorationPlan,
  persistRestorationPlan,
  loadAllRestorationPlans,
  type WorkspaceRestorationPlan,
} from './workspaceRestorationPlanner'
import { runCognitiveWorkspaceRuntime, type CognitiveWorkspaceState } from './cognitiveWorkspaceRuntime'

export interface WorkspaceCompositionSnapshot {
  spec: WorkspaceSpec
  sessionFlow: SessionFlowPrediction
  restorationPlan: WorkspaceRestorationPlan
  cognitiveState: CognitiveWorkspaceState
  savedWorkspaceCount: number
  composedAt: number
}

export function composeAutonomousWorkspace(input: {
  workspaceId: string
  activeApps: string[]
  dominantPattern: string
  dominantAppId: string
  suggestedContext: string
  activeLayoutId?: string
  anomalyCount: number
  activeWorkflows: string[]
}): WorkspaceCompositionSnapshot {
  const spec = buildContextWorkspace({
    workspaceId: input.workspaceId,
    dominantPattern: input.dominantPattern,
    activeApps: input.activeApps,
    suggestedContext: input.suggestedContext,
  })

  const sessionFlow = predictSessionFlow({
    dominantAppId: input.dominantAppId,
    workspaceId: input.workspaceId,
    activeApps: input.activeApps,
  })

  const restorationPlan = buildRestorationPlan({
    workspaceId: input.workspaceId,
    appsToRestore: input.activeApps,
    layoutId: input.activeLayoutId ?? spec.suggestedLayoutId,
    workflows: input.activeWorkflows,
  })

  persistRestorationPlan(restorationPlan)

  const cognitiveState = runCognitiveWorkspaceRuntime({
    workspaceId: input.workspaceId,
    spec,
    sessionFlow,
    anomalyCount: input.anomalyCount,
  })

  const savedWorkspaces = loadAllRestorationPlans()

  return {
    spec,
    sessionFlow,
    restorationPlan,
    cognitiveState,
    savedWorkspaceCount: Object.keys(savedWorkspaces).length,
    composedAt: Date.now(),
  }
}
