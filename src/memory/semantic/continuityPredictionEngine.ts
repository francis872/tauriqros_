import type { WorkspaceId } from '../../workspace/workspaceModels'
import type { SemanticGraphSnapshot } from './semanticGraphEngine'

export function predictContinuityStep(snapshot: SemanticGraphSnapshot): {
  nextWorkspace: WorkspaceId
  rationale: string
  confidence: number
} {
  const latest = [...snapshot.nodes].sort((a, b) => b.updatedAt - a.updatedAt)[0]

  if (!latest) {
    return {
      nextWorkspace: 'focus',
      rationale: 'No semantic memory found. Defaulting to focus surface.',
      confidence: 0.42,
    }
  }

  const nextWorkspace = latest.workspaceId === 'research'
    ? 'development'
    : latest.workspaceId

  return {
    nextWorkspace,
    rationale: `Recent memory trend centers on ${latest.label}.`,
    confidence: Number(Math.min(0.97, latest.score + 0.04).toFixed(2)),
  }
}
