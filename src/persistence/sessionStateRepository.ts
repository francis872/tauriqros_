import type { WorkspaceId } from '../workspace/workspaceModels'

const CONTINUITY_KEY = 'tauriq.session-continuity.v1'

export interface WorkflowContinuityRecord {
  id: string
  title: string
  status: 'active' | 'paused' | 'waiting'
  workspaceId: WorkspaceId
  updatedAt: number
}

export interface SessionContinuitySnapshot {
  lastWorkspaceId: WorkspaceId
  unfinishedTasks: string[]
  workflows: WorkflowContinuityRecord[]
  contextMemory: string[]
  recentFiles: string[]
  updatedAt: number
}

export function getDefaultContinuitySnapshot(workspaceId: WorkspaceId): SessionContinuitySnapshot {
  return {
    lastWorkspaceId: workspaceId,
    unfinishedTasks: [
      'Review startup lifecycle manager telemetry',
      'Tune workspace restoration order for development flow',
    ],
    workflows: [
      {
        id: 'resume-ai-project',
        title: 'Resume yesterday AI project',
        status: 'active',
        workspaceId: 'ai',
        updatedAt: Date.now() - 1000 * 60 * 40,
      },
      {
        id: 'continue-architecture-session',
        title: 'Continue startup architecture session',
        status: 'paused',
        workspaceId: 'development',
        updatedAt: Date.now() - 1000 * 60 * 85,
      },
    ],
    contextMemory: [
      'User prioritizes operating-runtime realism over dashboard aesthetics.',
      'Linux session integration and continuity recovery are the current north star.',
    ],
    recentFiles: ['src/runtime/useSessionRuntime.ts', 'src/services/desktopOrchestrator.ts'],
    updatedAt: Date.now(),
  }
}

export function loadContinuitySnapshot(workspaceId: WorkspaceId): SessionContinuitySnapshot {
  try {
    const raw = window.localStorage.getItem(CONTINUITY_KEY)
    if (!raw) {
      const fallback = getDefaultContinuitySnapshot(workspaceId)
      window.localStorage.setItem(CONTINUITY_KEY, JSON.stringify(fallback))
      return fallback
    }

    return JSON.parse(raw) as SessionContinuitySnapshot
  } catch {
    return getDefaultContinuitySnapshot(workspaceId)
  }
}

export function saveContinuitySnapshot(snapshot: SessionContinuitySnapshot) {
  try {
    window.localStorage.setItem(
      CONTINUITY_KEY,
      JSON.stringify({
        ...snapshot,
        updatedAt: Date.now(),
      }),
    )
  } catch {
    // Ignore storage write failures.
  }
}
