/**
 * Focus Layout Engine — Phase 11
 * Computes focus-optimized layout recommendations based on which app
 * is currently active and what cognitive mode the user is in.
 */

import type { SnapLayoutId } from '../../windows/layoutTemplates'

export type CognitiveMode = 'deep-work' | 'research' | 'development' | 'review' | 'collaboration'

export interface FocusLayoutRecommendation {
  suggestedLayoutId: SnapLayoutId
  cognitiveMode: CognitiveMode
  focusAppId: string
  distractionAppIds: string[]
  focusScore: number
  reasoning: string
}

const APP_MODE_MAP: Record<string, CognitiveMode> = {
  'ai-app': 'deep-work',
  'terminal': 'development',
  'monitor': 'review',
  'files': 'review',
}

const MODE_LAYOUT_MAP: Record<CognitiveMode, SnapLayoutId> = {
  'deep-work': 'ai-focus',
  'research': 'research',
  'development': 'coding',
  'review': '2-main-left',
  'collaboration': '3-main-left',
}

export function computeFocusLayout(input: {
  focusedAppId: string
  openAppIds: string[]
  activeLayoutId?: SnapLayoutId | null
}): FocusLayoutRecommendation {
  const cognitiveMode = APP_MODE_MAP[input.focusedAppId] ?? 'development'
  const suggestedLayoutId = MODE_LAYOUT_MAP[cognitiveMode]

  // Identify distraction apps (open but not in focus)
  const distractionAppIds = input.openAppIds
    .filter((id) => id !== input.focusedAppId)
    .slice(0, 3)

  const focusScore = Number(
    Math.min(0.99, 0.6 + (1 / Math.max(1, input.openAppIds.length)) * 0.4).toFixed(2),
  )

  const layoutChanged = suggestedLayoutId !== input.activeLayoutId
  const reasoning = layoutChanged
    ? `${cognitiveMode} mode detected for ${input.focusedAppId} — ${suggestedLayoutId} layout recommended`
    : `Current layout optimized for ${cognitiveMode} mode`

  return {
    suggestedLayoutId,
    cognitiveMode,
    focusAppId: input.focusedAppId,
    distractionAppIds,
    focusScore,
    reasoning,
  }
}
