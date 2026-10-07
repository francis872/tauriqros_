export interface RuntimePrioritySignal {
  aiQueueDepth: number
  battery: number
  thermalC: number
  activeAgents: number
}

export function resolveRuntimePriority(signal: RuntimePrioritySignal): 'performance' | 'balanced' | 'resilience' {
  if (signal.thermalC > 75 || signal.battery < 25) {
    return 'resilience'
  }

  if (signal.aiQueueDepth > 6 || signal.activeAgents > 3) {
    return 'performance'
  }

  return 'balanced'
}
