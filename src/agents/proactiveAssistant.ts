import type { SessionContinuitySnapshot } from '../persistence/sessionStateRepository'

export function buildProactiveAssistantHint(snapshot: SessionContinuitySnapshot) {
  if (snapshot.workflows.length > 0) {
    return `Restoring workflow context: ${snapshot.workflows[0].title}`
  }

  return 'No workflow context pending. Open launcher for recommendations.'
}
