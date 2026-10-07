import type { RuntimeServiceNode } from '../core/runtimeCoreModels'
import type { ProcessEvent } from '../core/unifiedProcessManager'
import type { DeviceTelemetrySnapshot } from '../devices/deviceTelemetryRuntime'

export interface IntelligenceCenterSnapshot {
  summary: string
  traceItems: string[]
  aiRuntimeOnline: boolean
  tokenThroughputTps: number
  retrievalHits: number
  queueDepth: number
}

export function buildIntelligenceCenterSnapshot(input: {
  services: RuntimeServiceNode[]
  processEvents: ProcessEvent[]
  devices: DeviceTelemetrySnapshot
  queueDepth?: number
  retrievalHits?: number
  tokenThroughputTps?: number
}): IntelligenceCenterSnapshot {
  const degraded = input.services.filter((service) => service.state === 'degraded' || service.state === 'failed').length

  return {
    summary: degraded > 0
      ? `Runtime is guarded with ${degraded} degraded services.`
      : 'Runtime supervisor healthy. No degraded services detected.',
    traceItems: input.processEvents.slice(0, 4).map((event) => event.message),
    aiRuntimeOnline: input.services.some((service) => service.id === 'ai-runtime' && service.state !== 'failed'),
    tokenThroughputTps: input.tokenThroughputTps ?? 0,
    retrievalHits: input.retrievalHits ?? 0,
    queueDepth: input.queueDepth ?? 0,
  }
}
