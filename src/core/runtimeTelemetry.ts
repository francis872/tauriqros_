import type { RuntimeServiceNode, RuntimeTelemetryPoint } from './runtimeCoreModels'

export function captureRuntimeTelemetry(services: RuntimeServiceNode[]): RuntimeTelemetryPoint {
  const degradedServices = services.filter((service) => service.state === 'degraded' || service.state === 'failed').length

  return {
    timestamp: Date.now(),
    cpuLoad: 26 + Math.floor(Math.random() * 36),
    memoryLoad: 33 + Math.floor(Math.random() * 41),
    aiQueueDepth: Math.max(0, 5 - degradedServices) + Math.floor(Math.random() * 4),
    degradedServices,
  }
}
