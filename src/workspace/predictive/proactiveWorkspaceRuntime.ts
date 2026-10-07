import type { WorkspaceId } from '../workspaceModels'

export function buildProactiveWorkspacePrompt(input: {
  workspaceId: WorkspaceId
  anomalies: number
  predictedWorkflow: string
}) {
  if (input.anomalies > 0) {
    return `Runtime detected ${input.anomalies} anomalies. Open Monitor before resuming ${input.predictedWorkflow}.`
  }

  return `Context is stable. Suggest continuing ${input.predictedWorkflow} in ${input.workspaceId} workspace.`
}
