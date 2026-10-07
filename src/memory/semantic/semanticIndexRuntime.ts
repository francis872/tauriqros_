import type { SemanticGraphSnapshot } from './semanticGraphEngine'

export function buildSemanticIndex(snapshot: SemanticGraphSnapshot) {
  const entries = new Map<string, string[]>()

  snapshot.nodes.forEach((node) => {
    const tokens = [node.label, ...node.tags, node.kind, node.workspaceId]
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)

    tokens.forEach((token) => {
      const current = entries.get(token) ?? []
      if (!current.includes(node.id)) {
        entries.set(token, [...current, node.id])
      }
    })
  })

  return {
    terms: entries.size,
    entries: Object.fromEntries(entries.entries()),
  }
}
