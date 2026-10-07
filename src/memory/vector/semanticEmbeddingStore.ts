import { upsertVectorMemory, listVectorMemory } from './vectorMemoryEngine'

export function storeSemanticEmbedding(input: {
  id: string
  source: string
  vector: number[]
  metadata?: Record<string, string>
}) {
  return upsertVectorMemory({
    id: input.id,
    source: input.source,
    vector: input.vector,
    metadata: input.metadata ?? {},
  })
}

export function getEmbeddingStoreStats() {
  const items = listVectorMemory()
  return {
    count: items.length,
    dimensions: items[0]?.vector.length ?? 0,
  }
}
