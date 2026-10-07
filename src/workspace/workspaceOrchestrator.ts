import { WORKSPACES, type WorkspaceId } from './workspaceModels'

export interface WorkspaceSnapshot {
  workspaceId: WorkspaceId
  openWindowIds: string[]
  focusedWindowId: string | null
  capturedAt: number
}

export function getWorkspaceDefinition(workspaceId: WorkspaceId) {
  return WORKSPACES.find((workspace) => workspace.id === workspaceId) ?? WORKSPACES[0]
}

export function captureWorkspaceSnapshot(input: {
  workspaceId: WorkspaceId
  openWindowIds: string[]
  focusedWindowId: string | null
}): WorkspaceSnapshot {
  return {
    workspaceId: input.workspaceId,
    openWindowIds: input.openWindowIds,
    focusedWindowId: input.focusedWindowId,
    capturedAt: Date.now(),
  }
}
