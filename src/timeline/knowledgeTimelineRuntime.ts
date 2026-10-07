import type { SemanticGraphSnapshot } from '../memory/semantic/semanticGraphEngine'

export interface TimelineEvent {
  id: string
  label: string
  cluster: string
  at: number
}

export function buildKnowledgeTimeline(snapshot: SemanticGraphSnapshot): TimelineEvent[] {
  return snapshot.nodes
    .map((node) => ({
      id: node.id,
      label: node.label,
      cluster: `${node.workspaceId}:${node.kind}`,
      at: node.updatedAt,
    }))
    .sort((a, b) => b.at - a.at)
    .slice(0, 24)
}
