/**
 * Context Workspace Builder — Phase 11
 * Builds workspace specifications from contextual signals:
 * project context, semantic continuity, and intent predictions.
 */

export interface WorkspaceAppSpec {
  appId: string
  priority: number
  reason: string
  suggestedLayoutSlot: number
}

export interface WorkspaceSpec {
  workspaceId: string
  label: string
  suggestedApps: WorkspaceAppSpec[]
  suggestedLayoutId: string
  contextTags: string[]
  estimatedProductivityScore: number
}

// Maps known context patterns to workspace configurations
const CONTEXT_CONFIGS: Record<string, Partial<WorkspaceSpec>> = {
  'tauriq': {
    label: 'TAURIQ Development',
    suggestedApps: [
      { appId: 'ai-app', priority: 1, reason: 'AI-first development workflow', suggestedLayoutSlot: 0 },
      { appId: 'monitor', priority: 2, reason: 'Runtime telemetry essential for TAURIQ dev', suggestedLayoutSlot: 1 },
      { appId: 'terminal', priority: 3, reason: 'Build and run commands', suggestedLayoutSlot: 2 },
    ],
    suggestedLayoutId: 'coding',
    contextTags: ['development', 'ai', 'runtime'],
    estimatedProductivityScore: 0.91,
  },
  'research': {
    label: 'Research Session',
    suggestedApps: [
      { appId: 'ai-app', priority: 1, reason: 'AI research assistant', suggestedLayoutSlot: 0 },
      { appId: 'monitor', priority: 2, reason: 'Track research metrics', suggestedLayoutSlot: 1 },
    ],
    suggestedLayoutId: 'research',
    contextTags: ['research', 'ai', 'analysis'],
    estimatedProductivityScore: 0.84,
  },
}

export function buildContextWorkspace(input: {
  workspaceId: string
  dominantPattern: string
  activeApps: string[]
  suggestedContext: string
}): WorkspaceSpec {
  const configKey = Object.keys(CONTEXT_CONFIGS).find((k) =>
    input.dominantPattern.toLowerCase().includes(k) ||
    input.suggestedContext.toLowerCase().includes(k),
  )

  const base = configKey ? CONTEXT_CONFIGS[configKey] : {}

  return {
    workspaceId: input.workspaceId,
    label: base.label ?? `${input.dominantPattern} Workspace`,
    suggestedApps: base.suggestedApps ?? input.activeApps.map((appId, i) => ({
      appId,
      priority: i + 1,
      reason: 'Currently active application',
      suggestedLayoutSlot: i,
    })),
    suggestedLayoutId: base.suggestedLayoutId ?? '2-main-left',
    contextTags: base.contextTags ?? [input.suggestedContext],
    estimatedProductivityScore: base.estimatedProductivityScore ?? 0.65,
  }
}
