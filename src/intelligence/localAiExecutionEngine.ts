import { invokeNativeSafe } from '../services/tauriBridge'

export interface AiExecutionRequest {
  prompt: string
  model: 'llama3' | 'qwen' | 'phi3'
  mode: 'local' | 'hybrid'
  maxTokens: number
}

export interface AiExecutionResult {
  mode: 'local' | 'hybrid-fallback'
  model: string
  output: string
  tokens: number
  gpuAware: boolean
}

export async function runLocalAiInference(request: AiExecutionRequest): Promise<AiExecutionResult> {
  const native = await invokeNativeSafe<AiExecutionResult>(
    'ai_runtime_infer',
    {
      prompt: request.prompt,
      model: request.model,
      mode: request.mode,
      maxTokens: request.maxTokens,
    },
    () => ({
      mode: request.mode === 'local' ? 'local' : 'hybrid-fallback',
      model: request.model,
      output: `TAURIQ local inference summary: ${request.prompt.slice(0, 64)}...`,
      tokens: Math.min(request.maxTokens, 192),
      gpuAware: false,
    }),
  )

  return native
}
