export interface PredictedInput {
  inputType: 'keyboard' | 'pointer' | 'gesture' | 'voice' | 'command'
  predictedAction: string
  confidence: number   // 0–1
  leadTimeMs: number
  preloadAdvised: boolean
}

export function predictNextInput(input: {
  currentAppId: string
  intentConfidence: number
  sessionInteractions: number
  dominantPattern: string
}): PredictedInput {
  const { currentAppId, intentConfidence, dominantPattern } = input
  const actionMap: Record<string, string> = {
    'ai': 'open-chat',
    'code': 'run-build',
    'browser': 'navigate',
    'terminal': 'execute-command',
    'monitor': 'inspect-panel',
  }
  const predicted = actionMap[currentAppId] ?? actionMap[dominantPattern] ?? 'focus-window'

  return {
    inputType: intentConfidence > 0.75 ? 'command' : 'keyboard',
    predictedAction: predicted,
    confidence: Math.min(0.95, intentConfidence),
    leadTimeMs: Math.round(500 - intentConfidence * 300),
    preloadAdvised: intentConfidence > 0.7,
  }
}
