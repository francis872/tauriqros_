export type RuntimeModelTarget = 'local' | 'cloud' | 'hybrid'

export interface ModelProviderRuntime {
  id: string
  target: RuntimeModelTarget
  status: 'offline' | 'ready' | 'planned'
  role: 'chat' | 'embedding' | 'rerank' | 'memory'
}

export const MODEL_PROVIDER_RUNTIME: ModelProviderRuntime[] = [
  { id: 'ollama-local', target: 'local', status: 'planned', role: 'chat' },
  { id: 'llama-cpp', target: 'local', status: 'planned', role: 'embedding' },
  { id: 'cloud-gateway', target: 'cloud', status: 'ready', role: 'chat' },
  { id: 'hybrid-router', target: 'hybrid', status: 'ready', role: 'memory' },
]

export function selectRuntimeProvider(preferLocal: boolean) {
  if (preferLocal) {
    return MODEL_PROVIDER_RUNTIME.find((provider) => provider.target === 'local') ?? MODEL_PROVIDER_RUNTIME[0]
  }

  return MODEL_PROVIDER_RUNTIME.find((provider) => provider.target === 'hybrid') ?? MODEL_PROVIDER_RUNTIME[0]
}
