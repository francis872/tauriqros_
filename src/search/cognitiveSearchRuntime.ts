import type { SemanticGraphSnapshot } from '../memory/semantic/semanticGraphEngine'
import { inferSearchIntent } from './intentAwareSearch'
import { rankSemanticQuery } from './semanticQueryEngine'
import { temporalRank } from './temporalSearchRuntime'
import { projectRecallSearch } from './projectRecallSearch'

export function runCognitiveSearch(input: {
  query: string
  snapshot: SemanticGraphSnapshot
  workspaceId?: string
}) {
  const intent = inferSearchIntent(input.query)
  const scopedNodes = input.workspaceId
    ? input.snapshot.nodes.filter((node) => node.workspaceId === input.workspaceId)
    : input.snapshot.nodes

  const semantic = rankSemanticQuery(scopedNodes, input.query)
  const temporal = temporalRank(scopedNodes)
  const temporalMap = new Map(temporal.map((entry) => [entry.node.id, entry.temporalBoost]))

  const ranked = semantic
    .map((entry) => ({
      node: entry.node,
      score: Number((entry.score + (temporalMap.get(entry.node.id) ?? 0)).toFixed(3)),
    }))
    .sort((a, b) => b.score - a.score)

  return {
    intent,
    results: ranked.slice(0, 8),
    recall: projectRecallSearch(input.snapshot, input.workspaceId),
  }
}
