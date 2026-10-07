import type { SessionMemorySnapshot, UserIdentityProfile } from './profileModels'

const PROFILE_KEY = 'tauriq.profile.v1'
const SESSION_KEY = 'tauriq.session-memory.v1'

export function getDefaultProfile(): UserIdentityProfile {
  const now = Date.now()

  return {
    id: 'local-user',
    displayName: 'Francisco',
    role: 'System Architect',
    city: 'Madrid',
    timezone: 'Europe/Madrid',
    preferredWorkspace: 'development',
    recentProjects: ['TAURIQ Core', 'AI Launcher Workflows', 'Linux Session Bridge'],
    routines: ['Morning architecture review', 'Midday AI workflow sprint', 'Evening session recap'],
    goals: [
      { id: 'goal-1', title: 'Finalize workspace intelligence', completed: false },
      { id: 'goal-2', title: 'Stabilize runtime orchestration', completed: false },
      { id: 'goal-3', title: 'Prepare Linux session packaging', completed: true },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

export function loadProfile(): UserIdentityProfile {
  const fallback = getDefaultProfile()

  try {
    const serialized = window.localStorage.getItem(PROFILE_KEY)
    if (!serialized) {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(fallback))
      return fallback
    }

    return { ...fallback, ...JSON.parse(serialized) } as UserIdentityProfile
  } catch {
    return fallback
  }
}

export function saveProfile(profile: UserIdentityProfile) {
  try {
    window.localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({
        ...profile,
        updatedAt: Date.now(),
      }),
    )
  } catch {
    // Ignore storage write errors in constrained environments.
  }
}

export function loadSessionMemory(): SessionMemorySnapshot | null {
  try {
    const serialized = window.localStorage.getItem(SESSION_KEY)
    if (!serialized) {
      return null
    }

    return JSON.parse(serialized) as SessionMemorySnapshot
  } catch {
    return null
  }
}

export function saveSessionMemory(snapshot: SessionMemorySnapshot) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore storage write errors in constrained environments.
  }
}
