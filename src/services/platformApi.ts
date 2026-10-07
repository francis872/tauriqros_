import { invokeNativeSafe } from './tauriBridge'

export async function runtimeApiGetHealth() {
  return invokeNativeSafe('runtime_supervisor_state', undefined, () => ({ status: 'healthy', source: 'fallback' }))
}

export async function filesystemApiGetSemanticSummary(query: string) {
  return invokeNativeSafe('filesystem_semantic_summary', { query }, () => ({
    query,
    summary: 'Semantic indexing fallback active.',
  }))
}

export async function aiApiInfer(prompt: string) {
  return invokeNativeSafe('ai_runtime_infer', { prompt, model: 'llama3', mode: 'hybrid', maxTokens: 192 }, () => ({
    mode: 'hybrid-fallback',
    model: 'llama3',
    output: `Fallback AI summary: ${prompt.slice(0, 64)}...`,
    tokens: 120,
    gpuAware: false,
  }))
}
