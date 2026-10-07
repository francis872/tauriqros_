export function balanceGpuTasks(input: {
  queueDepth: number
  utilization: number
}) {
  if (input.utilization > 85) {
    return {
      strategy: 'cpu-fallback',
      sliceMs: 24,
    }
  }

  return {
    strategy: input.queueDepth > 3 ? 'gpu-priority' : 'balanced',
    sliceMs: input.queueDepth > 3 ? 12 : 18,
  }
}
