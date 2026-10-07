export type GesturePattern = 'swipe-left' | 'swipe-right' | 'pinch' | 'expand' | 'drag-snap' | 'scroll-zoom'

export interface GestureContext {
  recognizedPattern: GesturePattern | null
  gestureCount: number
  gestureAccuracy: number   // 0–1
  contextualAction: string
  lastGestureAt: number
}

export function computeGestureContext(input: {
  sessionInteractions: number
  activeApp: string
  uiPressure: 'low' | 'moderate' | 'high'
}): GestureContext {
  const { sessionInteractions, activeApp, uiPressure } = input
  const patterns: GesturePattern[] = ['swipe-right', 'drag-snap', 'scroll-zoom']
  const pattern = uiPressure === 'high' ? null : patterns[sessionInteractions % patterns.length]
  const actions: Record<string, string> = {
    'swipe-right': 'switch-workspace',
    'drag-snap': 'snap-window',
    'scroll-zoom': 'zoom-workspace',
  }
  return {
    recognizedPattern: pattern,
    gestureCount: Math.floor(sessionInteractions * 0.3),
    gestureAccuracy: Math.min(1, 0.5 + sessionInteractions * 0.01),
    contextualAction: pattern ? (actions[pattern] ?? 'none') : `${activeApp}-default`,
    lastGestureAt: Date.now() - Math.floor(Math.random() * 5000),
  }
}
