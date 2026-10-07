import type { EnvironmentWeather, UserIdentityProfile } from '../profiles/profileModels'
import { loadProfile } from '../profiles/profileStorage'
import { restoreDesktopSession } from '../runtime/sessionPersistence'
import { buildPresenceInsights } from '../intelligence/workspaceIntelligence'

export interface SessionStartupState {
  profile: UserIdentityProfile
  weather: EnvironmentWeather
  restored: boolean
  activeProjects: number
  unfinishedGoals: number
}

export function createWeatherSnapshot(): EnvironmentWeather {
  const conditionSequence: EnvironmentWeather['condition'][] = ['clear', 'cloudy', 'rain', 'clear']
  const hour = new Date().getHours()
  const condition = conditionSequence[hour % conditionSequence.length]

  return {
    condition,
    temperatureC: 17 + (hour % 8),
    humidity: 36 + (hour % 25),
    windKmh: 10 + (hour % 14),
  }
}

export function bootstrapSessionStartup(): SessionStartupState {
  const profile = loadProfile()
  const restored = restoreDesktopSession()
  const unfinishedGoals = profile.goals.filter((goal) => !goal.completed).length

  return {
    profile,
    weather: createWeatherSnapshot(),
    restored,
    activeProjects: profile.recentProjects.length,
    unfinishedGoals,
  }
}

export function getPresenceForStartup(state: SessionStartupState) {
  return buildPresenceInsights({
    profile: state.profile,
    unfinishedGoals: state.unfinishedGoals,
    restored: state.restored,
    activeProjects: state.activeProjects,
  })
}
