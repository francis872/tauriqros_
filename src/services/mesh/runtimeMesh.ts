import { discoverMeshServices } from './serviceDiscovery'
import { callMeshEndpoint } from './internalRpc'

export async function bootstrapRuntimeMesh() {
  const services = discoverMeshServices()

  const heartbeat = await Promise.all(
    services.map(async (service) => ({
      id: service.id,
      ok: await callMeshEndpoint(service.endpoint),
    })),
  )

  return {
    services,
    heartbeat,
    topology: {
      nodes: services.length,
      healthy: heartbeat.filter((item) => item.ok).length,
    },
    loadState: heartbeat.some((item) => !item.ok) ? 'degraded' : 'stable',
  }
}
