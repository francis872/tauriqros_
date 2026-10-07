export interface ContinuityContext {
  workspaceId: string
  lastPattern: string
  savedAt: number
  focusFlowSteps: string[]
  restoredCount: number
}

const STORAGE_KEY = 'tauriq:workspace-continuity.v1'

export function saveContinuityContext(ctx: ContinuityContext): void {
  try {
    const existing = loadAllContinuityContexts()
    const idx = existing.findIndex((c) => c.workspaceId === ctx.workspaceId)
    if (idx >= 0) existing[idx] = ctx
    else existing.push(ctx)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch { /* ignore */ }
}

export function loadAllContinuityContexts(): ContinuityContext[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ContinuityContext[]
  } catch { /* ignore */ }
  return []
}

export function computeContinuityScore(contexts: ContinuityContext[]): number {
  if (!contexts.length) return 0
  const avgRestored = contexts.reduce((s, c) => s + c.restoredCount, 0) / contexts.length
  return Math.min(1, avgRestored * 0.2 + contexts.length * 0.1)
}
