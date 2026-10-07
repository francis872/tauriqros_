export function buildContextualRetrieval(input: {
  query: string
  candidates: Array<{ label: string; workspaceId: string }>
}) {
  return input.candidates.map((candidate, index) => ({
    ...candidate,
    relevance: Number((0.88 - index * 0.07).toFixed(2)),
    contextWindow: `${input.query} -> ${candidate.workspaceId}`,
  }))
}
