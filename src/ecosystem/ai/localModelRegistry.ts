import { invokeNativeSafe } from '../../services/tauriBridge'

export interface RuntimeModelDescriptor {
  id: string
  loaded: boolean
  provider: 'local' | 'cloud' | 'hybrid' | 'peer'
}

export async function getRuntimeModelRegistry(): Promise<RuntimeModelDescriptor[]> {
  const models = await invokeNativeSafe<Array<{ id: string; loaded: boolean }> | { models: string[] }>(
    'ai_runtime_models',
    undefined,
    async () => [
      { id: 'llama3', loaded: true },
      { id: 'qwen', loaded: false },
      { id: 'phi3', loaded: false },
    ],
  )

  const normalized = Array.isArray(models)
    ? models
    : models.models.map((id, index) => ({ id, loaded: index === 0 }))

  return normalized.map((model, index) => ({
    ...model,
    provider: index === 0 ? 'local' : index === 1 ? 'hybrid' : 'peer',
  }))
}
