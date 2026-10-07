import { listVectorMemory, upsertVectorMemory } from './vectorMemoryEngine'

export function compressVectorMemory(maxItems = 64) {
  const items = listVectorMemory()
  if (items.length <= maxItems) {
    return { dropped: 0, remaining: items.length }
  }

  const removable = items.slice(maxItems)
  removable.forEach((item) => {
    upsertVectorMemory({
      ...item,
      metadata: {
        ...item.metadata,
        compressed: 'true',
      },
      vector: item.vector.slice(0, Math.min(item.vector.length, 8)),
    })
  })

  return {
    dropped: removable.length,
    remaining: items.length,
  }
}
