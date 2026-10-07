import type { UserIdentityProfile } from '../profiles/profileModels'
import type { SessionContinuitySnapshot } from '../persistence/sessionStateRepository'

export interface AiContinuityInsight {
  greeting: string
  startupNarrative: string
  suggestedAction: string
  unfinishedWorkflowCount: number
}

function resolvePartOfDay(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) {
    return 'morning'
  }
  if (hour < 19) {
    return 'afternoon'
  }
  return 'evening'
}

export function buildAiContinuityInsight(
  profile: UserIdentityProfile,
  snapshot: SessionContinuitySnapshot,
): AiContinuityInsight {
  const dayPart = resolvePartOfDay(new Date().getHours())
  const unfinishedWorkflowCount = snapshot.workflows.filter((workflow) => workflow.status !== 'waiting').length

  return {
    greeting: `Good ${dayPart}, ${profile.displayName}.`,
    startupNarrative: unfinishedWorkflowCount > 0
      ? `${unfinishedWorkflowCount} unfinished AI workflows detected. Restoring continuity channels.`
      : 'TAURIQ runtime initialized. No unfinished workflows detected.',
    suggestedAction: snapshot.unfinishedTasks[0] ?? 'Open launcher to continue your prioritized workflow.',
    unfinishedWorkflowCount,
  }
}
