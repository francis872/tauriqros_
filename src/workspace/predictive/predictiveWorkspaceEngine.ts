import type { WorkspaceId } from '../workspaceModels'
import type { SemanticGraphSnapshot } from '../../memory/semantic/semanticGraphEngine'
import { resolveAdaptiveLayout } from './adaptiveLayoutRuntime'
import { suggestContextualLaunch } from './contextualLaunchEngine'
import { forecastNextWorkflow } from './workflowForecastEngine'
import { buildProactiveWorkspacePrompt } from './proactiveWorkspaceRuntime'

export function buildPredictiveWorkspaceState(input: {
  workspaceId: WorkspaceId
  semanticMemory: SemanticGraphSnapshot
  queueDepth: number
  anomalies: number
}) {
  const forecast = forecastNextWorkflow(input.semanticMemory)

  return {
    adaptiveLayout: resolveAdaptiveLayout(input.workspaceId, input.queueDepth),
    launchPlan: suggestContextualLaunch(input.workspaceId),
    forecast,
    prompt: buildProactiveWorkspacePrompt({
      workspaceId: input.workspaceId,
      anomalies: input.anomalies,
      predictedWorkflow: forecast.workflow,
    }),
  }
}
