/**
 * Crash Continuity Runtime — Phase 11
 * Maintains semantic continuity through crashes and service failures.
 * Persists critical runtime state so it can be restored after recovery.
 */

const CONTINUITY_KEY = 'tauriq:crash-continuity.v1'

export interface ContinuityCheckpoint {
  workspaceId: string
  activeApps: string[]
  layoutId: string
  semanticContext: string
  agentState: string
  savedAt: number
  version: number
}

export interface CrashContinuityState {
  lastCheckpoint: ContinuityCheckpoint | null
  checkpointAge: number
  continuityAvailable: boolean
  restorationReadiness: 'ready' | 'stale' | 'unavailable'
}

export function saveCheckpoint(input: {
  workspaceId: string
  activeApps: string[]
  layoutId: string
}): ContinuityCheckpoint {
  const checkpoint: ContinuityCheckpoint = {
    workspaceId: input.workspaceId,
    activeApps: input.activeApps,
    layoutId: input.layoutId,
    semanticContext: `workspace:${input.workspaceId}`,
    agentState: 'active',
    savedAt: Date.now(),
    version: 1,
  }

  try {
    localStorage.setItem(CONTINUITY_KEY, JSON.stringify(checkpoint))
  } catch { /* ignore */ }

  return checkpoint
}

export function loadContinuityState(): CrashContinuityState {
  let lastCheckpoint: ContinuityCheckpoint | null = null

  try {
    const raw = localStorage.getItem(CONTINUITY_KEY)
    if (raw) lastCheckpoint = JSON.parse(raw) as ContinuityCheckpoint
  } catch { /* ignore */ }

  if (!lastCheckpoint) {
    return { lastCheckpoint: null, checkpointAge: 0, continuityAvailable: false, restorationReadiness: 'unavailable' }
  }

  const checkpointAge = Date.now() - lastCheckpoint.savedAt
  const continuityAvailable = checkpointAge < 86400000 // < 24h

  let restorationReadiness: CrashContinuityState['restorationReadiness'] = 'ready'
  if (!continuityAvailable) restorationReadiness = 'unavailable'
  else if (checkpointAge > 3600000) restorationReadiness = 'stale'

  return { lastCheckpoint, checkpointAge, continuityAvailable, restorationReadiness }
}
