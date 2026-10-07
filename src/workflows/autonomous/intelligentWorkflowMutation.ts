export interface WorkflowMutation {
  originalGoal: string
  mutatedGoal: string
  reason: string
  mutationType: 'reframe' | 'decompose' | 'merge' | 'defer'
  appliedAt: number
}

export function mutateWorkflows(input: {
  goals: string[]
  anomalyCount: number
  executionPressure: number
}): WorkflowMutation[] {
  const { goals, anomalyCount, executionPressure } = input
  const mutations: WorkflowMutation[] = []

  if (executionPressure > 0.7 && goals.length > 2) {
    mutations.push({
      originalGoal: goals[goals.length - 1] ?? 'secondary-task',
      mutatedGoal: 'deferred-task',
      reason: 'High execution pressure',
      mutationType: 'defer',
      appliedAt: Date.now(),
    })
  }

  if (anomalyCount > 2 && goals.length > 0) {
    mutations.push({
      originalGoal: goals[0],
      mutatedGoal: `${goals[0]} + anomaly-mitigation`,
      reason: `${anomalyCount} anomalies detected`,
      mutationType: 'reframe',
      appliedAt: Date.now(),
    })
  }

  return mutations
}
