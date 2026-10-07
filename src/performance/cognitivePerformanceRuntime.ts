import { scheduleGpuRuntime } from './gpuRuntimeScheduler'
import { buildAiAccelerationPlan } from './aiAccelerationRuntime'
import { optimizeRenderPipeline } from './renderOptimizationEngine'
import { optimizeStreamingPerformance } from './streamingPerformanceRuntime'

export function runCognitivePerformanceRuntime(input: {
  queueDepth: number
  thermalC: number
  battery: number
  peers: number
  activeWindows: number
  model: string
}) {
  return {
    gpu: scheduleGpuRuntime({ queueDepth: input.queueDepth, thermalC: input.thermalC }),
    ai: buildAiAccelerationPlan({ queueDepth: input.queueDepth, model: input.model }),
    render: optimizeRenderPipeline({ activeWindows: input.activeWindows, battery: input.battery }),
    streaming: optimizeStreamingPerformance({ queueDepth: input.queueDepth, peers: input.peers }),
  }
}
