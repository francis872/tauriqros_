/**
 * Contextual Model Profiles — Phase 11
 * Defines capability profiles for different AI model types used in TAURIQ.
 * Models are selected based on task requirements and resource constraints.
 */

export type ModelRole = 'fast-local' | 'reasoning' | 'memory' | 'cloud-fallback'

export interface ModelProfile {
  role: ModelRole
  modelId: string
  maxTokens: number
  avgLatencyMs: number
  vramRequiredMb: number
  capabilities: string[]
  idealFor: string[]
}

export const MODEL_PROFILES: ModelProfile[] = [
  {
    role: 'fast-local',
    modelId: 'phi3',
    maxTokens: 256,
    avgLatencyMs: 180,
    vramRequiredMb: 2048,
    capabilities: ['classification', 'short-response', 'intent-parsing'],
    idealFor: ['command parsing', 'quick answers', 'classification tasks'],
  },
  {
    role: 'reasoning',
    modelId: 'qwen',
    maxTokens: 2048,
    avgLatencyMs: 850,
    vramRequiredMb: 4096,
    capabilities: ['planning', 'coding', 'semantic-reasoning', 'multi-step'],
    idealFor: ['planning queries', 'code generation', 'complex reasoning'],
  },
  {
    role: 'memory',
    modelId: 'llama3',
    maxTokens: 4096,
    avgLatencyMs: 1200,
    vramRequiredMb: 5120,
    capabilities: ['recall', 'continuity', 'semantic-search', 'long-context'],
    idealFor: ['memory recall', 'continuity restoration', 'semantic search'],
  },
  {
    role: 'cloud-fallback',
    modelId: 'cloud-overflow',
    maxTokens: 8192,
    avgLatencyMs: 2500,
    vramRequiredMb: 0,
    capabilities: ['heavy-reasoning', 'large-context', 'overflow-inference'],
    idealFor: ['heavy reasoning tasks', 'when local GPU is overloaded'],
  },
]

export function getProfileByRole(role: ModelRole): ModelProfile {
  return MODEL_PROFILES.find((p) => p.role === role) ?? MODEL_PROFILES[0]
}

export function getProfileForTask(task: string): ModelProfile {
  const lower = task.toLowerCase()
  if (lower.includes('plan') || lower.includes('cod') || lower.includes('reason')) {
    return getProfileByRole('reasoning')
  }
  if (lower.includes('recall') || lower.includes('memory') || lower.includes('search')) {
    return getProfileByRole('memory')
  }
  return getProfileByRole('fast-local')
}
