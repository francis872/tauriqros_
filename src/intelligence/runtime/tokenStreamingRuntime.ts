import { invokeNativeSafe } from '../../services/tauriBridge'

export interface TokenStreamRequest {
  prompt: string
  modelId: string
  onToken: (token: string) => void
  signal?: AbortSignal
}

export interface TokenStreamSummary {
  tokens: number
  throughputTps: number
  completed: boolean
}

export async function streamRuntimeTokens(request: TokenStreamRequest): Promise<TokenStreamSummary> {
  if (request.signal?.aborted) {
    return { tokens: 0, throughputTps: 0, completed: false }
  }

  const startedAt = performance.now()
  const payload = await invokeNativeSafe<{ chunks: string[] }>(
    'ai_runtime_stream',
    { prompt: request.prompt, modelId: request.modelId },
    async () => ({
      chunks: ['TAURIQ', ' native', ' stream', ' runtime', ' fallback'],
    }),
  )

  let count = 0
  for (const chunk of payload.chunks) {
    if (request.signal?.aborted) {
      return {
        tokens: count,
        throughputTps: Number((count / Math.max((performance.now() - startedAt) / 1000, 0.1)).toFixed(2)),
        completed: false,
      }
    }
    request.onToken(chunk)
    count += 1
    await new Promise((resolve) => window.setTimeout(resolve, 20))
  }

  return {
    tokens: count,
    throughputTps: Number((count / Math.max((performance.now() - startedAt) / 1000, 0.1)).toFixed(2)),
    completed: true,
  }
}
