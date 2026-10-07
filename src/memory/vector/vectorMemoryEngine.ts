export interface VectorMemoryItem {
  id: string
  source: string
  vector: number[]
  metadata: Record<string, string>
  updatedAt: number
}

const vectorMemory = new Map<string, VectorMemoryItem>()

export function upsertVectorMemory(item: Omit<VectorMemoryItem, 'updatedAt'>) {
  const next: VectorMemoryItem = {
    ...item,
    updatedAt: Date.now(),
  }
  vectorMemory.set(item.id, next)
  return next
}

export function listVectorMemory() {
  return [...vectorMemory.values()].sort((a, b) => b.updatedAt - a.updatedAt)
}
