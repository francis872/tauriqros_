import type { WorkspaceId } from '../workspaceModels'
import type { LayoutPreset } from '../../windows/layoutIntelligence'

export function resolveAdaptiveLayout(workspaceId: WorkspaceId, queueDepth: number): LayoutPreset {
  if (workspaceId === 'focus') {
    return 'focus-single'
  }

  if (workspaceId === 'ai' || queueDepth > 2) {
    return 'ai-dual'
  }

  if (workspaceId === 'research') {
    return 'research-grid'
  }

  return 'split-code'
}
