import type { SemanticGraphSnapshot } from '../../memory/semantic/semanticGraphEngine'

export function forecastNextWorkflow(snapshot: SemanticGraphSnapshot) {
  const sorted = [...snapshot.nodes].sort((a, b) => b.updatedAt - a.updatedAt)
  const next = sorted[0]

  if (!next) {
    return {
      workflow: 'prepare-development-workspace',
      confidence: 0.41,
      reason: 'No semantic activity tracked yet.',
    }
  }

  return {
    workflow: next.kind === 'workflow' ? next.id : 'continue-architecture-session',
    confidence: Number(Math.min(0.95, next.score + 0.06).toFixed(2)),
    reason: `Recent semantic focus: ${next.label}.`,
  }
}
