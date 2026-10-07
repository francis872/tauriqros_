import type { SemanticGraphSnapshot } from '../../memory/semantic/semanticGraphEngine'

export function runSemanticSearchPipeline(snapshot: SemanticGraphSnapshot, query: string) {
  const normalized = query.toLowerCase()

  return snapshot.nodes
    .filter((node) => node.label.toLowerCase().includes(normalized) || node.tags.some((tag) => tag.includes(normalized)))
    .slice(0, 6)
}
