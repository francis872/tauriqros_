export type WorkflowHealth = 'healthy' | 'degraded' | 'recovering' | 'stalled'

export interface WorkflowRecoveryState {
  health: WorkflowHealth
  recoveredChains: number
  failedChains: number
  recoveryStrategy: 'retry' | 'replan' | 'escalate' | 'none'
  lastRecoveryMs: number
}

export function recoverWorkflows(input: {
  failedChainCount: number
  anomalyCount: number
  executionPressure: number
}): WorkflowRecoveryState {
  const { failedChainCount, anomalyCount, executionPressure } = input

  let health: WorkflowHealth = 'healthy'
  let strategy: WorkflowRecoveryState['recoveryStrategy'] = 'none'

  if (failedChainCount > 3 || anomalyCount > 5) {
    health = 'stalled'
    strategy = 'escalate'
  } else if (failedChainCount > 1 || executionPressure > 0.8) {
    health = 'recovering'
    strategy = 'replan'
  } else if (failedChainCount > 0 || anomalyCount > 2) {
    health = 'degraded'
    strategy = 'retry'
  }

  return {
    health,
    recoveredChains: Math.max(0, failedChainCount - (strategy === 'none' ? 0 : 1)),
    failedChains: failedChainCount,
    recoveryStrategy: strategy,
    lastRecoveryMs: strategy !== 'none' ? Date.now() : 0,
  }
}
