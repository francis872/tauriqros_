import type { WorkspaceId } from '../../workspace/workspaceModels'
import type { SemanticGraphSnapshot } from './semanticGraphEngine'

export function buildWorkspaceKnowledgeGraph(snapshot: SemanticGraphSnapshot) {
  const byWorkspace = new Map<WorkspaceId, number>()

  snapshot.nodes.forEach((node) => {
    byWorkspace.set(node.workspaceId, (byWorkspace.get(node.workspaceId) ?? 0) + 1)
  })

  return {
    nodes: snapshot.nodes.length,
    edges: snapshot.edges.length,
    workspaceDensity: Object.fromEntries(byWorkspace.entries()) as Record<WorkspaceId, number>,
  }
}
