import { runSemanticSearchPipeline } from './semanticSearchPipeline'

export function runHybridRecall(input: {
  query: string
  semanticSnapshot: Parameters<typeof runSemanticSearchPipeline>[0]
  vectorMatches: Array<{ id: string; score: number }>
}) {
  const semantic = runSemanticSearchPipeline(input.semanticSnapshot, input.query)

  return {
    semanticHits: semantic.length,
    vectorHits: input.vectorMatches.length,
    mergedScore: Number((semantic.length * 0.12 + input.vectorMatches.length * 0.09).toFixed(2)),
  }
}
