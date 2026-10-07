import { getModelCapability } from '../models/modelCapabilityRegistry'

export function routeInferenceModel(input: {
  prompt: string
  memoryPressureMb: number
  preferLocal: boolean
}) {
  if (input.preferLocal && input.memoryPressureMb < 2600) {
    return 'phi3'
  }

  if (input.prompt.length > 200 || input.memoryPressureMb > 3200) {
    return 'qwen'
  }

  const defaultCapability = getModelCapability('llama3')
  return defaultCapability ? defaultCapability.id : 'llama3'
}
