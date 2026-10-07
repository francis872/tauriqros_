export interface GpuInferencePlan {
  lane: 'cpu-only' | 'gpu-shared' | 'gpu-priority'
  concurrency: number
  thermalGuard: boolean
}

export function planGpuInference(input: {
  queueDepth: number
  gpuLoad: number
  thermalC: number
}): GpuInferencePlan {
  const thermalGuard = input.thermalC > 84

  if (thermalGuard || input.gpuLoad > 88) {
    return { lane: 'cpu-only', concurrency: 1, thermalGuard: true }
  }

  if (input.queueDepth > 3) {
    return { lane: 'gpu-priority', concurrency: 3, thermalGuard: false }
  }

  return { lane: 'gpu-shared', concurrency: 2, thermalGuard: false }
}
