export interface ProactiveSuggestion {
  id: string
  label: string
  action: string
  confidence: number   // 0–1
  category: 'workflow' | 'layout' | 'command' | 'focus' | 'memory'
  urgency: 'low' | 'normal' | 'high'
}

export function generateProactiveSuggestions(input: {
  dominantPattern: string
  intentConfidence: number
  uiPressure: 'low' | 'moderate' | 'high'
  healingActive: boolean
  activeWorkflowCount: number
}): ProactiveSuggestion[] {
  const { dominantPattern, intentConfidence, uiPressure, healingActive, activeWorkflowCount } = input
  const suggestions: ProactiveSuggestion[] = []

  if (intentConfidence > 0.7 && dominantPattern) {
    suggestions.push({
      id: 'prep-workspace',
      label: `Prepare ${dominantPattern} workspace`,
      action: 'compose-workspace',
      confidence: intentConfidence,
      category: 'layout',
      urgency: 'normal',
    })
  }

  if (healingActive) {
    suggestions.push({
      id: 'healing-alert',
      label: 'Self-healing in progress',
      action: 'show-healing-panel',
      confidence: 0.95,
      category: 'workflow',
      urgency: 'high',
    })
  }

  if (activeWorkflowCount > 2) {
    suggestions.push({
      id: 'workflow-focus',
      label: `${activeWorkflowCount} workflows active — focus mode?`,
      action: 'activate-focus-mode',
      confidence: 0.75,
      category: 'focus',
      urgency: 'normal',
    })
  }

  if (uiPressure === 'high') {
    suggestions.push({
      id: 'reduce-ui',
      label: 'Simplify UI for current pressure',
      action: 'reduce-visual-density',
      confidence: 0.88,
      category: 'layout',
      urgency: 'high',
    })
  }

  return suggestions
}
