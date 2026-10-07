export interface ContextIntent {
  id: string
  message: string
  workspaceId: string
  createdAt: number
}

export interface ContextSnapshot {
  recentIntents: ContextIntent[]
  unfinishedTasks: number
  activeProjectHints: string[]
  lastUpdatedAt: number
}

const CONTEXT_KEY = 'tauriq.context.v1'

export function loadContextSnapshot(): ContextSnapshot {
  try {
    const serialized = window.localStorage.getItem(CONTEXT_KEY)
    if (!serialized) {
      return {
        recentIntents: [],
        unfinishedTasks: 0,
        activeProjectHints: [],
        lastUpdatedAt: Date.now(),
      }
    }

    return JSON.parse(serialized) as ContextSnapshot
  } catch {
    return {
      recentIntents: [],
      unfinishedTasks: 0,
      activeProjectHints: [],
      lastUpdatedAt: Date.now(),
    }
  }
}

export function saveContextSnapshot(snapshot: ContextSnapshot) {
  try {
    window.localStorage.setItem(CONTEXT_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore storage errors.
  }
}

export function registerIntent(intent: Omit<ContextIntent, 'id' | 'createdAt'>) {
  const current = loadContextSnapshot()
  const nextIntent: ContextIntent = {
    id: `intent-${Date.now()}`,
    message: intent.message,
    workspaceId: intent.workspaceId,
    createdAt: Date.now(),
  }

  const nextSnapshot: ContextSnapshot = {
    ...current,
    recentIntents: [nextIntent, ...current.recentIntents].slice(0, 24),
    lastUpdatedAt: Date.now(),
  }

  saveContextSnapshot(nextSnapshot)
  return nextSnapshot
}
