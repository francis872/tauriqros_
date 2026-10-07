export interface GoalExecution {
  goalId: string
  description: string
  executionPath: string[]
  confidence: number   // 0–1
  predictedCompletionMs: number
  autonomouslyTriggered: boolean
}

export function executeGoalsPredictively(input: {
  activeGoals: string[]
  intentConfidence: number
  autonomyLevel: number
}): GoalExecution[] {
  const { activeGoals, intentConfidence, autonomyLevel } = input
  return activeGoals.slice(0, 4).map((goal, i) => {
    const path = ['observe', 'plan', 'execute', 'verify'].slice(0, Math.max(2, Math.round(autonomyLevel * 4)))
    return {
      goalId: `goal-exec-${i}`,
      description: goal,
      executionPath: path,
      confidence: Math.max(0.3, intentConfidence - i * 0.1),
      predictedCompletionMs: Math.round(500 + (1 - autonomyLevel) * 2000 + i * 200),
      autonomouslyTriggered: autonomyLevel > 0.65 && intentConfidence > 0.6,
    }
  })
}
