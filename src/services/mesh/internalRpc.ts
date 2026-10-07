import { invokeNativeSafe } from '../tauriBridge'

export async function callMeshEndpoint(endpoint: string, payload?: Record<string, unknown>) {
  return invokeNativeSafe(endpoint, payload, () => ({ status: 'fallback', endpoint }))
}
