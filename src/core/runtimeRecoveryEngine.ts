import type { RuntimeServiceNode } from './runtimeCoreModels'

export function recoverRuntimeServices(services: RuntimeServiceNode[]): {
  nextServices: RuntimeServiceNode[]
  actions: string[]
} {
  const actions: string[] = []

  const nextServices = services.map((service) => {
    if (service.state === 'failed') {
      actions.push(`Restarted failed service: ${service.title}`)
      return {
        ...service,
        state: 'starting' as const,
        restarts: service.restarts + 1,
        lastHeartbeat: Date.now(),
      }
    }

    if (service.state === 'degraded' && service.critical) {
      actions.push(`Escalated degraded critical service: ${service.title}`)
      return {
        ...service,
        state: 'starting' as const,
        restarts: service.restarts + 1,
      }
    }

    return service
  })

  return { nextServices, actions }
}
