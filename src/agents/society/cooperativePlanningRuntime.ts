export interface CooperativePlan {
  planId: string
  participants: string[]
  sharedGoal: string
  stepCount: number
  assignedSteps: Record<string, string>
  cooperationScore: number   // 0–1
  estimatedMs: number
}

export function buildCooperativePlan(input: {
  agentIds: string[]
  primaryGoal: string
  cooperationEfficiency: number  // 0–1
}): CooperativePlan {
  const { agentIds, primaryGoal, cooperationEfficiency } = input
  const steps = ['analyze', 'decompose', 'assign', 'execute', 'verify']
  const assigned: Record<string, string> = {}
  steps.forEach((step, i) => {
    assigned[step] = agentIds[i % Math.max(1, agentIds.length)] ?? 'agent-0'
  })
  return {
    planId: `coop-plan-${Date.now() % 100000}`,
    participants: agentIds.slice(0, 4),
    sharedGoal: primaryGoal,
    stepCount: steps.length,
    assignedSteps: assigned,
    cooperationScore: cooperationEfficiency,
    estimatedMs: Math.round(100 + (1 - cooperationEfficiency) * 400),
  }
}
