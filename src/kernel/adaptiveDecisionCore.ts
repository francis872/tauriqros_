export type DecisionPolicy = 'conservative' | 'balanced' | 'aggressive' | 'autonomous'

export interface AdaptiveDecision {
  policy: DecisionPolicy
  rationale: string
  confidence: number       // 0–1
  appliedAdaptations: string[]
  overrideActive: boolean
}

export function runAdaptiveDecisionCore(input: {
  executionPressure: number   // 0–1
  healingActive: boolean
  intentConfidence: number
  autonomyLevel: number       // 0–1
  anomalyCount: number
}): AdaptiveDecision {
  const { executionPressure, healingActive, intentConfidence, autonomyLevel, anomalyCount } = input

  let policy: DecisionPolicy = 'balanced'
  const adaptations: string[] = []

  if (anomalyCount > 4 || healingActive) {
    policy = 'conservative'
    adaptations.push('throttle-proactive-ops', 'prioritize-healing')
  } else if (autonomyLevel > 0.75 && intentConfidence > 0.7) {
    policy = 'autonomous'
    adaptations.push('enable-full-autonomy', 'pre-compose-workspace', 'predictive-scheduling')
  } else if (executionPressure < 0.3 && intentConfidence > 0.5) {
    policy = 'aggressive'
    adaptations.push('expand-prediction-window', 'increase-proactive-ops')
  }

  return {
    policy,
    rationale: `P=${executionPressure.toFixed(2)} heal=${healingActive} intent=${intentConfidence.toFixed(2)} autonomy=${autonomyLevel.toFixed(2)}`,
    confidence: Math.min(1, intentConfidence * 0.5 + autonomyLevel * 0.3 + (1 - executionPressure) * 0.2),
    appliedAdaptations: adaptations,
    overrideActive: healingActive && anomalyCount > 3,
  }
}
