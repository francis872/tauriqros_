import type { RuntimeServiceNode } from './runtimeCoreModels'

export interface ProcessEvent {
  id: string
  serviceId: string
  kind: 'heartbeat' | 'restart' | 'failure'
  timestamp: number
  message: string
  queueDepth?: number
  pressure?: number
}

export function synthesizeProcessEvents(services: RuntimeServiceNode[]): ProcessEvent[] {
  return services.map((service) => {
    if (service.state === 'failed') {
      return {
        id: `event-${service.id}`,
        serviceId: service.id,
        kind: 'failure',
        timestamp: Date.now(),
        message: `${service.title} reported failure signal.`,
      }
    }

    if (service.restarts > 0 || service.state === 'starting') {
      return {
        id: `event-${service.id}`,
        serviceId: service.id,
        kind: 'restart',
        timestamp: Date.now(),
        message: `${service.title} is recovering with restart policy.`,
      }
    }

    return {
      id: `event-${service.id}`,
      serviceId: service.id,
      kind: 'heartbeat',
      timestamp: Date.now(),
      message: `${service.title} heartbeat stable.`,
      queueDepth: service.id.includes('ai') ? 2 : 0,
      pressure: service.state === 'ready' ? 0.38 : 0.71,
    }
  })
}
