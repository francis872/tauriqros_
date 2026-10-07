import { invokeNativeSafe } from '../../services/tauriBridge'

export interface LoadedModel {
  id: string
  loaded: boolean
  loadedAt: number
}

const loadedModels = new Map<string, LoadedModel>()

export async function listLocalModels() {
  return invokeNativeSafe<Array<{ id: string; loaded: boolean }>>(
    'ai_model_list',
    undefined,
    () => [
      { id: 'llama3', loaded: loadedModels.has('llama3') },
      { id: 'qwen', loaded: loadedModels.has('qwen') },
      { id: 'phi3', loaded: loadedModels.has('phi3') },
    ],
  )
}

export async function loadModel(modelId: string) {
  await invokeNativeSafe('ai_model_load', { modelId }, () => ({ status: 'loaded' }))
  loadedModels.set(modelId, { id: modelId, loaded: true, loadedAt: Date.now() })
  return loadedModels.get(modelId)!
}

export async function unloadModel(modelId: string) {
  await invokeNativeSafe('ai_model_unload', { modelId }, () => ({ status: 'unloaded' }))
  loadedModels.delete(modelId)
  return { id: modelId, loaded: false }
}
