import type { WorkspaceId } from '../../workspace/workspaceModels'
import type { SemanticGraphSnapshot } from './semanticGraphEngine'

export function recallContextualMemory(input: {
  snapshot: SemanticGraphSnapshot
  query: string
  workspaceId?: WorkspaceId
}) {
  const normalized = input.query.trim().toLowerCase()

  return input.snapshot.nodes
    .filter((node) => (input.workspaceId ? node.workspaceId === input.workspaceId : true))
    .map((node) => {
      const labelScore = node.label.toLowerCase().includes(normalized) ? 0.5 : 0
      const tagScore = node.tags.some((tag) => tag.toLowerCase().includes(normalized)) ? 0.35 : 0
      const workspaceBoost = input.workspaceId && node.workspaceId === input.workspaceId ? 0.1 : 0
      return {
        node,
        rank: Number((node.score + labelScore + tagScore + workspaceBoost).toFixed(3)),
      }
    })
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 8)
}
