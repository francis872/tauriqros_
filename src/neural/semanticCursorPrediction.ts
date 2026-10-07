export interface CursorPrediction {
  predictedX: number
  predictedY: number
  targetElement: string
  confidence: number   // 0–1
  velocityPxMs: number
  predictionActive: boolean
}

export function predictSemanticCursor(input: {
  activeApp: string
  intentConfidence: number
  uiPressure: 'low' | 'moderate' | 'high'
}): CursorPrediction {
  const { activeApp, intentConfidence, uiPressure } = input
  const active = uiPressure === 'low' && intentConfidence > 0.5
  const targetMap: Record<string, string> = {
    ai: 'chat-input',
    monitor: 'cpu-panel',
    code: 'editor-viewport',
    browser: 'address-bar',
    terminal: 'input-line',
  }
  return {
    predictedX: active ? Math.round(400 + Math.sin(Date.now() / 1000) * 100) : 0,
    predictedY: active ? Math.round(300 + Math.cos(Date.now() / 1000) * 80) : 0,
    targetElement: targetMap[activeApp] ?? 'primary-surface',
    confidence: active ? intentConfidence * 0.8 : 0,
    velocityPxMs: active ? Math.round(2 + intentConfidence * 8) : 0,
    predictionActive: active,
  }
}
