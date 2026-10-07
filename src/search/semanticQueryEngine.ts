import type { SemanticMemoryNode } from '../memory/semantic/semanticGraphEngine'

export function rankSemanticQuery(nodes: SemanticMemoryNode[], query: string) {
  const normalized = query.toLowerCase()

  return nodes
    .map((node) => {
      const labelHit = node.label.toLowerCase().includes(normalized) ? 0.4 : 0
      const tagsHit = node.tags.some((tag) => tag.toLowerCase().includes(normalized)) ? 0.25 : 0
      return {
        node,
        score: Number((node.score + labelHit + tagsHit).toFixed(3)),
      }
    })
    .sort((a, b) => b.score - a.score)
}
