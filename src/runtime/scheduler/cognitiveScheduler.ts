import { resolveRuntimePriority } from './runtimePriorityEngine'
import { buildAdaptiveWorkloadPlan } from './adaptiveWorkloadManager'

export interface CognitiveSchedulerSnapshot {
  priority: 'performance' | 'balanced' | 'resilience'
  workload: ReturnType<typeof buildAdaptiveWorkloadPlan>
  executionMode: 'standard' | 'gpu-accelerated' | 'memory-guarded'
}

export function runCognitiveScheduler(input: {
  aiQueueDepth: number
  battery: number
  thermalC: number
  activeAgents: number
  gpuLoad?: number
  memoryPressure?: number
}): CognitiveSchedulerSnapshot {
  const memoryPressure = input.memoryPressure ?? 0.5
  const gpuLoad = input.gpuLoad ?? 45

  return {
    priority: resolveRuntimePriority(input),
    workload: buildAdaptiveWorkloadPlan(input),
    executionMode: memoryPressure > 0.82
      ? 'memory-guarded'
      : gpuLoad < 78
        ? 'gpu-accelerated'
        : 'standard',
  }
}
