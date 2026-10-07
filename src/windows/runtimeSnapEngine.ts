/**
 * TAURIQ Runtime Snap Engine
 * Cognitive window distribution — assigns windows to layout slots based on
 * focus state, activity score, z-index, and semantic relevance.
 *
 * This is the intelligence layer between the layout picker and the raw
 * window position updates in desktopStore.
 */

import type { AppWindow } from '../store/desktopStore'
import { LAYOUT_TEMPLATES, slotToPixelBounds, type SnapLayoutId, type SlotRect } from './layoutTemplates'

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface CognitiveWindowScore {
  windowId: string
  score: number
  reasons: string[]
}

/** Calculates cognitive priority score for a window in the current context. */
export function scoreWindowPriority(
  win: AppWindow,
  focusedId: string | null,
  slot0AppHints: string[],
): CognitiveWindowScore {
  let score = 0
  const reasons: string[] = []

  // Focused window is always the primary occupant
  if (win.id === focusedId) {
    score += 100
    reasons.push('focused')
  }

  // Recent activity: high z-index = recently touched
  const activityBonus = Math.min(win.zIndex / 5, 30)
  score += activityBonus
  if (win.zIndex > 200) reasons.push('recently-active')

  // Layout hint: if the app matches the slot0 hint for this layout, elevate it
  if (slot0AppHints.includes(win.appId)) {
    score += 20
    reasons.push('layout-preferred')
  }

  // AI app earns bonus in AI/creative workspaces
  if (win.appId === 'ai') {
    score += 15
    reasons.push('ai-cognitive')
  }

  // Terminal is high-priority for development flows
  if (win.appId === 'terminal') {
    score += 12
    reasons.push('terminal-dev')
  }

  // Files / editor are context anchors
  if (win.appId === 'files' || win.appId === 'editor') {
    score += 8
    reasons.push('context-anchor')
  }

  // Already snapped windows maintain their placement weight
  if (win.snap !== 'none') {
    score += 5
    reasons.push('previously-snapped')
  }

  return { windowId: win.id, score, reasons }
}

// ─── Slot assignment ──────────────────────────────────────────────────────────

export interface SnapSlotAssignment {
  windowId: string
  slot: SlotRect
  slotIndex: number
  score: CognitiveWindowScore
}

/**
 * Distributes visible workspace windows into layout slots.
 * The focused window always takes slot 0 (overrides scoring).
 * Remaining windows are ranked by cognitive score.
 */
export function distributeWindowsToSlots(
  windows: AppWindow[],
  layoutId: SnapLayoutId,
  focusedWindowId: string,
): SnapSlotAssignment[] {
  const template = LAYOUT_TEMPLATES[layoutId]
  if (!template) return []

  const visible = windows.filter((w) => !w.minimized)
  const hints = template.cognitive.slot0AppHints

  // Score all visible windows
  const scored = visible
    .map((w) => ({
      win: w,
      score: scoreWindowPriority(w, focusedWindowId, hints),
    }))
    .sort((a, b) => b.score.score - a.score.score)

  // Guarantee focused window is in slot 0
  const focusedIdx = scored.findIndex((s) => s.win.id === focusedWindowId)
  if (focusedIdx > 0) {
    const [focused] = scored.splice(focusedIdx, 1)
    scored.unshift(focused)
  }

  const assignments: SnapSlotAssignment[] = []
  for (let i = 0; i < Math.min(scored.length, template.slots.length); i++) {
    assignments.push({
      windowId: scored[i].win.id,
      slot: template.slots[i],
      slotIndex: i,
      score: scored[i].score,
    })
  }

  return assignments
}

// ─── Pixel bounds ─────────────────────────────────────────────────────────────

export interface PixelBounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Converts a SnapSlotAssignment array to a map of windowId → PixelBounds.
 * Uses viewport dimensions that account for the taskbar (-48px height).
 */
export function buildPixelBoundsMap(
  assignments: SnapSlotAssignment[],
): Map<string, PixelBounds> {
  const viewportW = window.innerWidth
  const viewportH = window.innerHeight - 48 // taskbar height

  const map = new Map<string, PixelBounds>()
  for (const a of assignments) {
    map.set(a.windowId, slotToPixelBounds(a.slot, viewportW, viewportH))
  }
  return map
}

// ─── Layout persistence ───────────────────────────────────────────────────────

const PERSISTENCE_KEY = 'tauriq:snap-layout-state'

export interface PersistedLayoutState {
  layoutId: SnapLayoutId
  workspaceId: string
  windowIds: string[]
  savedAt: number
}

export function persistLayoutState(state: PersistedLayoutState): void {
  try {
    const existing = loadPersistedLayouts()
    existing[state.workspaceId] = state
    localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(existing))
  } catch {
    // localStorage may be unavailable — graceful no-op
  }
}

export function loadPersistedLayouts(): Record<string, PersistedLayoutState> {
  try {
    const raw = localStorage.getItem(PERSISTENCE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, PersistedLayoutState>) : {}
  } catch {
    return {}
  }
}

export function getPersistedLayout(workspaceId: string): PersistedLayoutState | null {
  return loadPersistedLayouts()[workspaceId] ?? null
}
