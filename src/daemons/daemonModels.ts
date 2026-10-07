import type { WorkspaceId } from '../workspace/workspaceModels'

export type DaemonId =
  | 'ai-daemon'
  | 'workspace-daemon'
  | 'context-daemon'
  | 'indexing-daemon'
  | 'notification-daemon'
  | 'automation-daemon'
  | 'lifecycle-daemon'

export type DaemonHealth = 'starting' | 'ready' | 'degraded'

export interface DaemonState {
  id: DaemonId
  title: string
  scope: 'session' | 'runtime' | 'intelligence' | 'filesystem'
  health: DaemonHealth
  startedAt: number
  message: string
}

export interface DaemonBootstrapContext {
  preferredWorkspace: WorkspaceId
  activeWorkspace: WorkspaceId
  restoredWindows: number
}

export interface DaemonBootstrapResult {
  daemons: DaemonState[]
  startupDurationMs: number
}
