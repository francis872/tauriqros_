/**
 * TAURIQ Layout Template Library
 * Defines all snap layout configurations — base, extended, and cognitive.
 * Single source of truth for layout geometry used by SnapLayoutPicker,
 * runtimeSnapEngine, and desktopStore.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Normalised slot bounds — all values in [0, 1] fractions of the desktop area */
export interface SlotRect {
  x: number
  y: number
  w: number
  h: number
}

export type SnapLayoutStyle = 'focus' | 'split' | 'grid' | 'research' | 'creative'

export type SnapLayoutId =
  // Base
  | '2-equal'
  | '2-main-left'
  | '2-main-right'
  // Extended
  | '3-equal'
  | '3-main-left'
  | '4-grid'
  // Cognitive
  | 'ai-focus'
  | 'research'
  | 'coding'

export interface SnapLayoutTemplate {
  id: SnapLayoutId
  label: string
  description: string
  /** Minimum viewport width (px) to offer this layout */
  minViewportWidth: number
  slots: SlotRect[]
  cognitive: {
    style: SnapLayoutStyle
    /** Workspace IDs this layout is suggested for */
    suggestedFor: string[]
    /** App IDs that are a good fit for slot 0 */
    slot0AppHints: string[]
  }
  /** 'base' | 'extended' | 'cognitive' */
  tier: 'base' | 'extended' | 'cognitive'
}

// ─── Template library ─────────────────────────────────────────────────────────

export const LAYOUT_TEMPLATES: Record<SnapLayoutId, SnapLayoutTemplate> = {
  '2-equal': {
    id: '2-equal',
    label: '2 Equal',
    description: 'Two equal-width columns side by side',
    minViewportWidth: 0,
    tier: 'base',
    slots: [
      { x: 0,   y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
    cognitive: {
      style: 'split',
      suggestedFor: ['development', 'research'],
      slot0AppHints: [],
    },
  },

  '2-main-left': {
    id: '2-main-left',
    label: 'Main Left',
    description: 'Primary ⅔ left, reference ⅓ right',
    minViewportWidth: 0,
    tier: 'base',
    slots: [
      { x: 0,      y: 0, w: 2 / 3, h: 1 },
      { x: 2 / 3,  y: 0, w: 1 / 3, h: 1 },
    ],
    cognitive: {
      style: 'focus',
      suggestedFor: ['development', 'writing'],
      slot0AppHints: ['editor', 'files'],
    },
  },

  '2-main-right': {
    id: '2-main-right',
    label: 'Main Right',
    description: 'Reference ⅓ left, primary ⅔ right',
    minViewportWidth: 0,
    tier: 'base',
    slots: [
      { x: 0,      y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3,  y: 0, w: 2 / 3, h: 1 },
    ],
    cognitive: {
      style: 'focus',
      suggestedFor: ['ai', 'analysis'],
      slot0AppHints: ['ai', 'terminal'],
    },
  },

  '3-equal': {
    id: '3-equal',
    label: '3 Columns',
    description: 'Three equal columns — monitoring or research',
    minViewportWidth: 1280,
    tier: 'extended',
    slots: [
      { x: 0,      y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3,  y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3,  y: 0, w: 1 / 3, h: 1 },
    ],
    cognitive: {
      style: 'research',
      suggestedFor: ['research', 'monitoring'],
      slot0AppHints: [],
    },
  },

  '3-main-left': {
    id: '3-main-left',
    label: 'Main + 2',
    description: 'Primary left half, two stacked on right',
    minViewportWidth: 1280,
    tier: 'extended',
    slots: [
      { x: 0,   y: 0,   w: 0.5, h: 1   },
      { x: 0.5, y: 0,   w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
    cognitive: {
      style: 'focus',
      suggestedFor: ['development', 'monitoring'],
      slot0AppHints: ['editor', 'terminal'],
    },
  },

  '4-grid': {
    id: '4-grid',
    label: '2×2 Grid',
    description: 'Four equal quadrants — maximum density',
    minViewportWidth: 1440,
    tier: 'extended',
    slots: [
      { x: 0,   y: 0,   w: 0.5, h: 0.5 },
      { x: 0.5, y: 0,   w: 0.5, h: 0.5 },
      { x: 0,   y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
    cognitive: {
      style: 'grid',
      suggestedFor: ['monitoring', 'data'],
      slot0AppHints: [],
    },
  },

  'ai-focus': {
    id: 'ai-focus',
    label: 'AI Focus',
    description: 'AI assistant dominant with two context panels',
    minViewportWidth: 1440,
    tier: 'cognitive',
    slots: [
      { x: 0,    y: 0,   w: 0.65, h: 1   },
      { x: 0.65, y: 0,   w: 0.35, h: 0.5 },
      { x: 0.65, y: 0.5, w: 0.35, h: 0.5 },
    ],
    cognitive: {
      style: 'creative',
      suggestedFor: ['ai', 'creative'],
      slot0AppHints: ['ai'],
    },
  },

  'research': {
    id: 'research',
    label: 'Research',
    description: 'Wide reading area with reference panels',
    minViewportWidth: 1440,
    tier: 'cognitive',
    slots: [
      { x: 0,   y: 0,   w: 0.6, h: 1   },
      { x: 0.6, y: 0,   w: 0.4, h: 0.5 },
      { x: 0.6, y: 0.5, w: 0.4, h: 0.5 },
    ],
    cognitive: {
      style: 'research',
      suggestedFor: ['research', 'writing'],
      slot0AppHints: ['browser', 'files'],
    },
  },

  'coding': {
    id: 'coding',
    label: 'Coding',
    description: 'Editor + terminal + AI assistant',
    minViewportWidth: 1440,
    tier: 'cognitive',
    slots: [
      { x: 0,    y: 0,    w: 0.55, h: 0.65 },
      { x: 0,    y: 0.65, w: 0.55, h: 0.35 },
      { x: 0.55, y: 0,    w: 0.45, h: 1    },
    ],
    cognitive: {
      style: 'focus',
      suggestedFor: ['development'],
      slot0AppHints: ['editor', 'files'],
    },
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns all templates available at the given viewport width, ordered by tier */
export function getAvailableLayouts(viewportWidth: number): SnapLayoutTemplate[] {
  const tierOrder: Record<SnapLayoutTemplate['tier'], number> = {
    base: 0,
    extended: 1,
    cognitive: 2,
  }
  return Object.values(LAYOUT_TEMPLATES)
    .filter((t) => viewportWidth >= t.minViewportWidth)
    .sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])
}

/** Convert normalised slot to absolute pixel bounds */
export function slotToPixelBounds(slot: SlotRect, viewportW: number, viewportH: number) {
  return {
    x: Math.round(slot.x * viewportW),
    y: Math.round(slot.y * viewportH),
    width: Math.round(slot.w * viewportW),
    height: Math.round(slot.h * viewportH),
  }
}
