import type { InferenceExecutionMode } from './localInferenceRuntime'

export interface ModelRoutingContext {
  requiresLowLatency: boolean
  privacySensitive: boolean
  peerCapacity: number
  queueDepth: number
}

export function routeInferenceExecution(context: ModelRoutingContext): InferenceExecutionMode {
  if (context.privacySensitive) {
    return 'local'
  }

  if (context.peerCapacity > 0 && context.queueDepth > 3) {
    return 'distributed-peer'
  }

  if (context.requiresLowLatency) {
    return 'hybrid'
  }

  return 'cloud'
}
