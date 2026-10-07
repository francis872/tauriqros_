import type { SemanticGraphSnapshot, SemanticMemoryNode } from './semanticGraphEngine'

export interface TemporalMemoryBand {
  label: 'live' | 'recent' | 'historical'
  nodes: SemanticMemoryNode[]
}

export function buildTemporalMemoryBands(snapshot: SemanticGraphSnapshot): TemporalMemoryBand[] {
  const now = Date.now()
  const oneHour = 1000 * 60 * 60

  return [
    {
      label: 'live',
      nodes: snapshot.nodes.filter((node) => now - node.updatedAt < oneHour / 2),
    },
    {
      label: 'recent',
      nodes: snapshot.nodes.filter((node) => now - node.updatedAt >= oneHour / 2 && now - node.updatedAt < oneHour * 8),
    },
    {
      label: 'historical',
      nodes: snapshot.nodes.filter((node) => now - node.updatedAt >= oneHour * 8),
    },
  ]
}
