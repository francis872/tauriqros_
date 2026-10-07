export interface ThreadBalance {
  threadBalance: number   // 0–1 (1 = perfect balance)
  allocatedThreads: number
  idleThreads: number
  overloadedThreads: number
  balancingAction: 'none' | 'redistribute' | 'scale-up' | 'scale-down'
  threadEfficiency: number   // 0–1
}

export function balanceIntelligentThreads(input: {
  cpuLoad: number
  activeWorkers: number
  queueDepth: number
  availableCores: number
}): ThreadBalance {
  const { cpuLoad, activeWorkers, queueDepth, availableCores } = input
  const idealThreads = Math.min(availableCores, Math.max(2, Math.round(queueDepth * 0.5 + activeWorkers * 0.3)))
  const balance = 1 - Math.abs(activeWorkers - idealThreads) / Math.max(idealThreads, 1)
  const idle = Math.max(0, availableCores - activeWorkers)
  const overloaded = cpuLoad > 0.85 ? Math.max(0, activeWorkers - idealThreads) : 0

  let action: ThreadBalance['balancingAction'] = 'none'
  if (queueDepth > activeWorkers * 2) action = 'scale-up'
  else if (idle > 4) action = 'scale-down'
  else if (balance < 0.6) action = 'redistribute'

  return {
    threadBalance: Math.max(0, balance),
    allocatedThreads: idealThreads,
    idleThreads: idle,
    overloadedThreads: overloaded,
    balancingAction: action,
    threadEfficiency: Math.min(1, (1 - cpuLoad * 0.3) * balance),
  }
}
