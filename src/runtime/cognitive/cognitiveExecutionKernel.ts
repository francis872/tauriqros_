import { buildRuntimeExecutionGraph } from './runtimeExecutionGraph'
import { superviseExecutionRuntime } from './executionSupervisor'
import { buildLiveContextPipeline } from './liveContextPipeline'
import { predictExecutionStep } from './predictiveExecutionRuntime'

export function runCognitiveExecutionKernel(input: {
  queueDepth: number
  activeAgents: number
  retrievalHits: number
  thermalGuard: boolean
  memoryPressure: number
  memoryRecall: string
  activeWorkflow: string
  retrievalPreview: string
  retrievalConfidence: number
}) {
  const executionGraph = buildRuntimeExecutionGraph({
    queueDepth: input.queueDepth,
    activeAgents: input.activeAgents,
    retrievalHits: input.retrievalHits,
  })

  const supervisor = superviseExecutionRuntime({
    queueDepth: input.queueDepth,
    thermalGuard: input.thermalGuard,
    memoryPressure: input.memoryPressure,
  })

  const contextPipeline = buildLiveContextPipeline({
    memoryRecall: input.memoryRecall,
    activeWorkflow: input.activeWorkflow,
    retrievalPreview: input.retrievalPreview,
  })

  const prediction = predictExecutionStep({
    queueDepth: input.queueDepth,
    activeWorkflow: input.activeWorkflow,
    retrievalConfidence: input.retrievalConfidence,
  })

  return {
    executionGraph,
    supervisor,
    contextPipeline,
    prediction,
  }
}
