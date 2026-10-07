export type TransitionTrigger = 'intent-shift' | 'workflow-complete' | 'time-elapsed' | 'pressure-spike' | 'user-signal'

export interface WorkspaceTransition {
  fromState: string
  toState: string
  trigger: TransitionTrigger
  confidence: number   // 0–1
  estimatedMs: number
  predictedAt: number
}

export function predictWorkspaceTransitions(input: {
  currentPattern: string
  predictedPattern: string
  intentConfidence: number
  timeElapsedMs: number
  executionPressure: number
}): WorkspaceTransition[] {
  const { currentPattern, predictedPattern, intentConfidence, timeElapsedMs, executionPressure } = input
  const transitions: WorkspaceTransition[] = []

  if (predictedPattern && predictedPattern !== currentPattern && intentConfidence > 0.6) {
    transitions.push({
      fromState: currentPattern || 'default',
      toState: predictedPattern,
      trigger: 'intent-shift',
      confidence: intentConfidence,
      estimatedMs: Math.round(500 + (1 - intentConfidence) * 1000),
      predictedAt: Date.now(),
    })
  }

  if (executionPressure > 0.8) {
    transitions.push({
      fromState: currentPattern || 'default',
      toState: 'minimal',
      trigger: 'pressure-spike',
      confidence: executionPressure,
      estimatedMs: 200,
      predictedAt: Date.now(),
    })
  }

  if (timeElapsedMs > 1000 * 60 * 30) {
    transitions.push({
      fromState: currentPattern || 'default',
      toState: 'focus-renewal',
      trigger: 'time-elapsed',
      confidence: 0.6,
      estimatedMs: 1500,
      predictedAt: Date.now(),
    })
  }

  return transitions
}
