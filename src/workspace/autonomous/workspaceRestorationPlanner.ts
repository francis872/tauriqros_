/**
 * Workspace Restoration Planner — Phase 11
 * Plans the sequence of actions needed to restore a workspace to its
 * previous state: apps, layouts, AI sessions, timelines, and agent chains.
 */

const RESTORATION_PLAN_KEY = 'tauriq:workspace-restoration.v1'

export interface RestorationAction {
  type: 'open-app' | 'apply-layout' | 'restore-session' | 'resume-workflow' | 'load-context'
  payload: string
  priority: number
  estimatedMs: number
}

export interface WorkspaceRestorationPlan {
  workspaceId: string
  actions: RestorationAction[]
  estimatedTotalMs: number
  savedAt: number
  restorationReason: string
}

export function buildRestorationPlan(input: {
  workspaceId: string
  appsToRestore: string[]
  layoutId: string
  workflows: string[]
}): WorkspaceRestorationPlan {
  const actions: RestorationAction[] = []
  let priority = 1

  // Restore apps in order
  for (const appId of input.appsToRestore) {
    actions.push({
      type: 'open-app',
      payload: appId,
      priority: priority++,
      estimatedMs: 120,
    })
  }

  // Apply layout
  if (input.layoutId) {
    actions.push({
      type: 'apply-layout',
      payload: input.layoutId,
      priority: priority++,
      estimatedMs: 80,
    })
  }

  // Resume workflows
  for (const wf of input.workflows) {
    actions.push({
      type: 'resume-workflow',
      payload: wf,
      priority: priority++,
      estimatedMs: 200,
    })
  }

  // Restore AI session context
  actions.push({
    type: 'restore-session',
    payload: `${input.workspaceId}:ai-session`,
    priority: priority++,
    estimatedMs: 150,
  })

  const estimatedTotalMs = actions.reduce((s, a) => s + a.estimatedMs, 0)

  return {
    workspaceId: input.workspaceId,
    actions,
    estimatedTotalMs,
    savedAt: Date.now(),
    restorationReason: 'Session continuity restoration',
  }
}

export function persistRestorationPlan(plan: WorkspaceRestorationPlan): void {
  try {
    const existing = loadAllRestorationPlans()
    existing[plan.workspaceId] = plan
    localStorage.setItem(RESTORATION_PLAN_KEY, JSON.stringify(existing))
  } catch { /* ignore */ }
}

export function loadAllRestorationPlans(): Record<string, WorkspaceRestorationPlan> {
  try {
    const raw = localStorage.getItem(RESTORATION_PLAN_KEY)
    if (raw) return JSON.parse(raw) as Record<string, WorkspaceRestorationPlan>
  } catch { /* ignore */ }
  return {}
}
