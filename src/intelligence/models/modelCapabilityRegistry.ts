export interface ModelCapability {
  id: 'llama3' | 'qwen' | 'phi3'
  supportsStreaming: boolean
  supportsToolUse: boolean
  memoryCostMb: number
  gpuPreferred: boolean
  priorityClass: 'low-latency' | 'balanced' | 'deep-reasoning'
}

export const MODEL_CAPABILITY_REGISTRY: ModelCapability[] = [
  {
    id: 'llama3',
    supportsStreaming: true,
    supportsToolUse: true,
    memoryCostMb: 4200,
    gpuPreferred: true,
    priorityClass: 'balanced',
  },
  {
    id: 'qwen',
    supportsStreaming: true,
    supportsToolUse: false,
    memoryCostMb: 3200,
    gpuPreferred: false,
    priorityClass: 'low-latency',
  },
  {
    id: 'phi3',
    supportsStreaming: false,
    supportsToolUse: false,
    memoryCostMb: 1800,
    gpuPreferred: false,
    priorityClass: 'low-latency',
  },
]

export function getModelCapability(modelId: string) {
  return MODEL_CAPABILITY_REGISTRY.find((capability) => capability.id === modelId)
}
