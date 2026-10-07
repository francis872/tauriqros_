export interface DelegationRecord {
  fromAgentId: string
  toAgentId: string
  taskId: string
  taskDescription: string
  delegatedAt: number
  priority: 'low' | 'normal' | 'high' | 'critical'
}

export interface DelegationEngineState {
  activeDelegations: DelegationRecord[]
  delegationActive: boolean
  delegationLatencyMs: number
  autonomousDelegationCount: number
}

export function runAutonomousDelegationEngine(input: {
  activeGoals: string[]
  agentIds: string[]
  workloadPressure: number   // 0–1
}): DelegationEngineState {
  const { activeGoals, agentIds, workloadPressure } = input
  const delegations: DelegationRecord[] = activeGoals.slice(0, 3).map((goal, i) => ({
    fromAgentId: agentIds[0] ?? 'agent-coordinator-0',
    toAgentId: agentIds[(i + 1) % Math.max(2, agentIds.length)] ?? `agent-executor-${i}`,
    taskId: `task-${i}-${Date.now()}`,
    taskDescription: goal,
    delegatedAt: Date.now() - i * 1000,
    priority: workloadPressure > 0.7 ? 'high' : 'normal',
  }))

  return {
    activeDelegations: delegations,
    delegationActive: delegations.length > 0,
    delegationLatencyMs: Math.round(5 + workloadPressure * 25),
    autonomousDelegationCount: delegations.length,
  }
}
