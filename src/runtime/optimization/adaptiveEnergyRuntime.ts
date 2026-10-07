import { allocateAdaptiveResources } from './adaptiveResourceAllocator'
import { schedulePredictiveGpu } from './predictiveGpuScheduler'
import { balanceIntelligentThreads } from './intelligentThreadBalancer'
import { predictRenderLoad } from './renderLoadPredictor'
import { computeLatencyCompensation } from './latencyCompensationEngine'

export type EnergyMode = 'performance' | 'balanced' | 'efficient' | 'ultra-saver'

export interface RuntimeOptimizationSnapshot {
  cpuAllocation: number
  gpuSchedulePriority: ReturnType<typeof schedulePredictiveGpu>['priority']
  threadBalance: number
  renderPressure: number
  latencyCompensationMs: number
  energyMode: EnergyMode
  optimizationGain: number
  workloadShape: string
  thermalBudgetUsed: number
  resources: ReturnType<typeof allocateAdaptiveResources>
  gpuPlan: ReturnType<typeof schedulePredictiveGpu>
  threads: ReturnType<typeof balanceIntelligentThreads>
  renderLoad: ReturnType<typeof predictRenderLoad>
  latency: ReturnType<typeof computeLatencyCompensation>
  updatedAt: number
}

function resolveEnergyMode(thermalC: number, battery: number, gpuUtil: number): EnergyMode {
  if (battery < 20 || thermalC > 90) return 'ultra-saver'
  if (battery < 40 || thermalC > 75) return 'efficient'
  if (gpuUtil > 0.7) return 'performance'
  return 'balanced'
}

export function runAdaptiveRuntimeOptimization(input: {
  cpuLoad: number
  gpuUtil: number
  gpuThermalC: number
  vramUsedMb: number
  queueDepth: number
  activeApps: number
  inferenceActive: boolean
  inferenceLatencyMs: number
  battery: number
}): RuntimeOptimizationSnapshot {
  const { cpuLoad, gpuUtil, gpuThermalC, vramUsedMb, queueDepth, activeApps, inferenceActive, inferenceLatencyMs, battery } = input

  const resources = allocateAdaptiveResources({ cpuLoad, gpuUtil, queueDepth, activeApps, inferenceActive })
  const gpuPlan = schedulePredictiveGpu({ gpuUtil, gpuThermalC, queueDepth, vramUsedMb })
  const threads = balanceIntelligentThreads({ cpuLoad, activeWorkers: Math.max(2, activeApps), queueDepth, availableCores: 8 })
  const renderLoad = predictRenderLoad({ activeWindows: activeApps, gpuUtil, cpuLoad, animationsEnabled: true })
  const latency = computeLatencyCompensation({ baseLatencyMs: 30, queueDepth, inferenceLatencyMs })

  const energyMode = resolveEnergyMode(gpuThermalC, battery, gpuUtil)
  const optimizationGain = Math.min(1, resources.cpuAllocation * 0.3 + threads.threadEfficiency * 0.4 + (1 - renderLoad.renderPressure) * 0.3)

  return {
    cpuAllocation: resources.cpuAllocation,
    gpuSchedulePriority: gpuPlan.priority,
    threadBalance: threads.threadBalance,
    renderPressure: renderLoad.renderPressure,
    latencyCompensationMs: latency.compensationMs,
    energyMode,
    optimizationGain,
    workloadShape: resources.allocationStrategy,
    thermalBudgetUsed: gpuPlan.thermalBudgetUsed,
    resources,
    gpuPlan,
    threads,
    renderLoad,
    latency,
    updatedAt: Date.now(),
  }
}
