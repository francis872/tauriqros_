import type { UserIdentityProfile } from '../profiles/profileModels'
import type { WorkspaceId } from '../workspace/workspaceModels'

export interface PresenceInsight {
  id: string
  label: string
  tone: 'info' | 'focus' | 'alert'
}

export function getDynamicGreeting(name: string, hour = new Date().getHours()) {
  if (hour < 12) {
    return `Good morning, ${name}.`
  }

  if (hour < 18) {
    return `Good afternoon, ${name}.`
  }

  return `Good evening, ${name}.`
}

export function selectRecommendedWorkspace(profile: UserIdentityProfile, activeGoals: number): WorkspaceId {
  if (activeGoals > 2) {
    return 'focus'
  }

  return profile.preferredWorkspace
}

export function buildPresenceInsights(input: {
  profile: UserIdentityProfile
  unfinishedGoals: number
  restored: boolean
  activeProjects: number
}): PresenceInsight[] {
  const insights: PresenceInsight[] = []

  insights.push({
    id: 'restoration',
    label: input.restored
      ? 'Development workspace restored from your previous session.'
      : 'Fresh session initialized with your preferred workspace.',
    tone: input.restored ? 'focus' : 'info',
  })

  insights.push({
    id: 'goals',
    label: `${input.unfinishedGoals} unfinished goals detected for today.`,
    tone: input.unfinishedGoals > 0 ? 'alert' : 'info',
  })

  insights.push({
    id: 'projects',
    label: `${input.activeProjects} active projects in your continuity layer.`,
    tone: 'info',
  })

  insights.push({
    id: 'routine',
    label: `Suggested next routine: ${input.profile.routines[0]}.`,
    tone: 'focus',
  })

  return insights
}
