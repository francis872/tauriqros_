export interface VisualOptimizerState {
  renderOptimized: boolean
  optimizedPipeline: string
  droppedLayers: number
  batchedDrawCalls: number
  adaptiveQuality: number  // 0–1
  gpuSavingsMb: number
}

export function optimizeRuntimeVisuals(input: {
  gpuUtil: number
  activeWindows: number
  compressionLevel: 'none' | 'light' | 'moderate' | 'aggressive'
}): VisualOptimizerState {
  const { gpuUtil, activeWindows, compressionLevel } = input
  const optimized = compressionLevel !== 'none' || gpuUtil > 0.6
  const dropped = compressionLevel === 'aggressive' ? 4 : compressionLevel === 'moderate' ? 2 : 0
  const quality = Math.max(0.2, 1 - gpuUtil * 0.5 - dropped * 0.05)

  const pipelines = {
    none: 'standard-render',
    light: 'optimized-composite',
    moderate: 'gpu-efficient',
    aggressive: 'minimal-path',
  }

  return {
    renderOptimized: optimized,
    optimizedPipeline: pipelines[compressionLevel],
    droppedLayers: dropped,
    batchedDrawCalls: Math.round(activeWindows * 4 * (1 - dropped * 0.1)),
    adaptiveQuality: quality,
    gpuSavingsMb: Math.round(dropped * 50 + gpuUtil * 30),
  }
}
