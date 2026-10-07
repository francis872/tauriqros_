import { invokeNativeSafe } from '../../services/tauriBridge'

export interface TokenStreamEvent {
  token: string
  done: boolean
}

export async function streamInferenceTokens(input: {
  prompt: string
  modelId: string
  onToken: (event: TokenStreamEvent) => void
}) {
  const native = await invokeNativeSafe<{ chunks: string[] }>(
    'ai_stream_infer',
    {
      prompt: input.prompt,
      modelId: input.modelId,
    },
    () => ({
      chunks: ['TAURIQ', ' streaming', ' inference', ' fallback'],
    }),
  )

  native.chunks.forEach((chunk, index) => {
    input.onToken({ token: chunk, done: index === native.chunks.length - 1 })
  })
}
