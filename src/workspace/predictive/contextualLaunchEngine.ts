import type { WorkspaceId } from '../workspaceModels'

const WORKSPACE_APPS: Record<WorkspaceId, string[]> = {
  focus: ['notes', 'terminal'],
  development: ['files', 'terminal', 'monitor'],
  research: ['files', 'notes', 'monitor'],
  ai: ['ai', 'monitor', 'notes'],
  creative: ['notes', 'files'],
}

export function suggestContextualLaunch(workspaceId: WorkspaceId) {
  return WORKSPACE_APPS[workspaceId]
}
