export type UiPressureLevel = 'low' | 'moderate' | 'high'

export interface PredictiveInterfaceState {
  currentTask: string
  uiPressure: UiPressureLevel
  contextSensitivity: number   // 0–1
  adaptationTriggers: string[]
  generatedSections: number
  lastAdaptedAt: number
}

export function computePredictiveInterfaceState(input: {
  dominantPattern: string
  anomalyCount: number
  intentConfidence: number
  activeWorkflowCount: number
  healingActive: boolean
}): PredictiveInterfaceState {
  const { dominantPattern, anomalyCount, intentConfidence, activeWorkflowCount, healingActive } = input
  const pressureScore = anomalyCount * 0.2 + (healingActive ? 0.3 : 0) + activeWorkflowCount * 0.1
  const uiPressure: UiPressureLevel = pressureScore > 0.6 ? 'high' : pressureScore > 0.3 ? 'moderate' : 'low'

  const triggers: string[] = []
  if (intentConfidence > 0.7) triggers.push('high-intent-signal')
  if (healingActive) triggers.push('healing-override')
  if (activeWorkflowCount > 2) triggers.push('workflow-saturation')
  if (anomalyCount > 3) triggers.push('anomaly-alert')

  return {
    currentTask: dominantPattern || 'general-work',
    uiPressure,
    contextSensitivity: Math.min(1, intentConfidence * 0.7 + (1 - pressureScore * 0.3)),
    adaptationTriggers: triggers,
    generatedSections: Math.max(1, Math.round(3 + intentConfidence * 4)),
    lastAdaptedAt: Date.now(),
  }
}
