import type { SemanticGraphSnapshot } from '../../memory/semantic/semanticGraphEngine'

export function runLiveKnowledgeIndexer(snapshot: SemanticGraphSnapshot, filesIndexed: number) {
  return {
    semanticNodes: snapshot.nodes.length,
    semanticEdges: snapshot.edges.length,
    filesIndexed,
    knowledgeHealth: snapshot.nodes.length > 0 ? 'active' : 'warming',
  }
}
