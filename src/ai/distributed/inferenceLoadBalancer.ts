/**
 * Inference Load Balancer — Phase 11
 * Distributes inference load across available models and execution lanes.
 * Prevents GPU overload by routing overflow to cloud fallback or queuing.
 */

export type LoadBalanceStrategy = 'round-robin' | 'least-loaded' | 'priority-first' | 'thermal-safe'

export interface LoadBalancerState {
  strategy: LoadBalanceStrategy
  activeLanes: number
  queuedJobs: number
  droppedJobs: number
  overflowToCloud: boolean
  balancingScore: number
  recommendedAction: string
}

export function balanceInferenceLoad(input: {
  queueDepth: number
  gpuUtil: number
  gpuThermalC: number
  peerCount: number
}): LoadBalancerState {
  let strategy: LoadBalanceStrategy = 'priority-first'
  let overflowToCloud = false
  let recommendedAction = 'Normal operation — priority scheduling active'

  if (input.gpuThermalC > 80) {
    strategy = 'thermal-safe'
    recommendedAction = 'Thermal throttle active — batching reduced'
  } else if (input.gpuUtil > 85) {
    strategy = 'least-loaded'
    recommendedAction = 'GPU load high — routing to least-loaded lane'
  } else if (input.queueDepth > 6) {
    overflowToCloud = true
    recommendedAction = 'Queue overflow — routing excess to cloud fallback'
  }

  if (input.peerCount > 0 && input.queueDepth > 4) {
    strategy = 'round-robin'
    recommendedAction = `Distributing across ${input.peerCount + 1} nodes via round-robin`
  }

  const activeLanes = Math.max(1, Math.min(4, input.peerCount + 1))
  const queuedJobs = Math.max(0, input.queueDepth)
  const droppedJobs = input.queueDepth > 10 ? input.queueDepth - 10 : 0

  const balancingScore = Number(
    Math.min(1, activeLanes * 0.25 - input.gpuUtil * 0.003 - input.queueDepth * 0.02).toFixed(2),
  )

  return {
    strategy,
    activeLanes,
    queuedJobs,
    droppedJobs,
    overflowToCloud,
    balancingScore: Math.max(0, balancingScore),
    recommendedAction,
  }
}
