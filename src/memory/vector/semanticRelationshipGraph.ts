import { listVectorMemory } from './vectorMemoryEngine'

export interface SemanticRelationship {
  source: string
  target: string
  weight: number
}

export function buildSemanticRelationshipGraph(): SemanticRelationship[] {
  const items = listVectorMemory()
  const edges: SemanticRelationship[] = []

  for (let i = 0; i < items.length; i += 1) {
    if (i + 1 >= items.length) {
      break
    }

    const current = items[i]
    const next = items[i + 1]

    edges.push({
      source: current.id,
      target: next.id,
      weight: Number((0.6 + ((i % 3) * 0.1)).toFixed(2)),
    })
  }

  return edges
}
