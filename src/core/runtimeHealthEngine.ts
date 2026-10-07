import type { RuntimeServiceNode, UnifiedRuntimeState } from './runtimeCoreModels'

function countStates(services: RuntimeServiceNode[]) {
  return {
    failed: services.filter((service) => service.state === 'failed').length,
    degraded: services.filter((service) => service.state === 'degraded').length,
    starting: services.filter((service) => service.state === 'starting').length,
  }
}

export function evaluateRuntimeHealth(services: RuntimeServiceNode[]): UnifiedRuntimeState['status'] {
  const counts = countStates(services)

  if (counts.failed > 0) {
    return 'critical'
  }

  if (counts.degraded > 0 || counts.starting > 2) {
    return 'guarded'
  }

  return 'healthy'
}
