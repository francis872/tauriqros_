import { invokeNativeSafe } from '../../services/tauriBridge'

export interface EmbeddingVector {
  id: string
  values: number[]
}

export async function generateEmbedding(input: { text: string; modelId: string }): Promise<EmbeddingVector> {
  const response = await invokeNativeSafe<{ vector: number[] }>(
    'ai_runtime_embeddings',
    { text: input.text, modelId: input.modelId },
    async () => ({
      vector: Array.from({ length: 16 }, (_, i) => Number(((input.text.length % (i + 5)) / 10).toFixed(3))),
    }),
  )

  return {
    id: `emb-${Date.now()}`,
    values: response.vector,
  }
}
