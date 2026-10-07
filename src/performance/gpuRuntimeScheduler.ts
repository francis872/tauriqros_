export function scheduleGpuRuntime(input: { queueDepth: number; thermalC: number }) {
  return {
    gpuLane: input.thermalC > 80 ? 'throttled' : 'active',
    concurrency: input.queueDepth > 3 ? 2 : 1,
  }
}
