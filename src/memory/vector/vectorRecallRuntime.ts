import { listVectorMemory } from './vectorMemoryEngine'

function cosineLike(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length)
  let dot = 0
  let magA = 0
  let magB = 0

  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }

  return dot / Math.max(Math.sqrt(magA) * Math.sqrt(magB), 0.0001)
}

export function recallByVector(query: number[], limit = 5) {
  return listVectorMemory()
    .map((item) => ({ item, score: Number(cosineLike(item.vector, query).toFixed(4)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
