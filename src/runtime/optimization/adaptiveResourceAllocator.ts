export interface ResourceAllocation {
  cpuAllocation: number      // 0–1
  memoryAllocation: number   // 0–1
  gpuAllocation: number      // 0–1
  networkBudget: number      // 0–1
  allocationStrategy: 'balanced' | 'ai-heavy' | 'ui-heavy' | 'io-heavy'
}

export function allocateAdaptiveResources(input: {
  cpuLoad: number
  gpuUtil: number
  queueDepth: number
  activeApps: number
  inferenceActive: boolean
}): ResourceAllocation {
  const { cpuLoad, gpuUtil, queueDepth, activeApps, inferenceActive } = input

  let strategy: ResourceAllocation['allocationStrategy'] = 'balanced'
  if (inferenceActive && gpuUtil > 0.6) strategy = 'ai-heavy'
  else if (activeApps > 5) strategy = 'ui-heavy'
  else if (queueDepth > 8) strategy = 'io-heavy'

  const inferenceBoost = inferenceActive ? 0.2 : 0
  return {
    cpuAllocation: Math.min(1, 1 - cpuLoad * 0.4 + (strategy === 'io-heavy' ? 0.1 : 0)),
    memoryAllocation: Math.min(1, 0.6 + activeApps * 0.03),
    gpuAllocation: Math.min(1, 0.5 + inferenceBoost + queueDepth * 0.02),
    networkBudget: Math.min(1, 0.3 + (strategy === 'io-heavy' ? 0.3 : 0)),
    allocationStrategy: strategy,
  }
}
