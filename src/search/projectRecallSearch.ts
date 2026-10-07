import type { SemanticGraphSnapshot } from '../memory/semantic/semanticGraphEngine'

export function projectRecallSearch(snapshot: SemanticGraphSnapshot, workspaceId?: string) {
  return snapshot.nodes
    .filter((node) => node.kind === 'project' || node.kind === 'workflow')
    .filter((node) => (workspaceId ? node.workspaceId === workspaceId : true))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 6)
}
