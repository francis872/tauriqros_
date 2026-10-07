import type { WorkspaceId } from '../workspace/workspaceModels'

export type LayoutPreset = 'focus-single' | 'split-code' | 'research-grid' | 'ai-dual'

export function recommendLayoutForWorkspace(workspaceId: WorkspaceId): LayoutPreset {
  if (workspaceId === 'development') {
    return 'split-code'
  }

  if (workspaceId === 'research') {
    return 'research-grid'
  }

  if (workspaceId === 'ai') {
    return 'ai-dual'
  }

  return 'focus-single'
}
