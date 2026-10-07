export type GpuPriority = 'low' | 'normal' | 'high' | 'critical'

export interface GpuSchedulePlan {
  priority: GpuPriority
  batchSize: number
  thermalBudgetUsed: number   // 0–1
  scheduledJobs: string[]
  deferredJobs: string[]
  estimatedCompletionMs: number
}

export function schedulePredictiveGpu(input: {
  gpuUtil: number
  gpuThermalC: number
  queueDepth: number
  vramUsedMb: number
  vramTotalMb?: number
}): GpuSchedulePlan {
  const { gpuUtil, gpuThermalC, queueDepth, vramUsedMb, vramTotalMb = 8192 } = input
  const thermalBudget = Math.min(1, (gpuThermalC - 40) / 50)
  const vramPressure = vramUsedMb / vramTotalMb

  let priority: GpuPriority = 'normal'
  if (thermalBudget > 0.85 || vramPressure > 0.9) priority = 'critical'
  else if (gpuUtil > 0.8) priority = 'high'
  else if (gpuUtil < 0.3) priority = 'low'

  const maxBatch = priority === 'critical' ? 1 : priority === 'high' ? 2 : 4
  const scheduled = Array.from({ length: Math.min(queueDepth, maxBatch) }, (_, i) => `job-${i}`)
  const deferred = Array.from({ length: Math.max(0, queueDepth - maxBatch) }, (_, i) => `deferred-${i}`)

  return {
    priority,
    batchSize: maxBatch,
    thermalBudgetUsed: thermalBudget,
    scheduledJobs: scheduled,
    deferredJobs: deferred,
    estimatedCompletionMs: Math.round(50 + queueDepth * 30 * (1 + gpuUtil)),
  }
}
