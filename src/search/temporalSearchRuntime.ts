import type { SemanticMemoryNode } from '../memory/semantic/semanticGraphEngine'

export function temporalRank(nodes: SemanticMemoryNode[]) {
  const now = Date.now()
  const hour = 1000 * 60 * 60

  return nodes.map((node) => {
    const ageHours = (now - node.updatedAt) / hour
    const temporalBoost = ageHours < 1 ? 0.25 : ageHours < 8 ? 0.12 : 0
    return {
      node,
      temporalBoost,
    }
  })
}
