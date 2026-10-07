export interface PrioritizedTask {
  taskId: string
  description: string
  priority: number   // 0–1 (1 = highest)
  urgency: 'critical' | 'high' | 'normal' | 'low'
  dependsOn: string[]
}

export function prioritizeTasks(input: {
  goals: string[]
  executionPressure: number
  anomalyCount: number
  intentConfidence: number
}): PrioritizedTask[] {
  const { goals, executionPressure, anomalyCount, intentConfidence } = input
  return goals.map((goal, i) => {
    const basePriority = 1 - i * 0.15 - executionPressure * 0.1
    const urgency: PrioritizedTask['urgency'] =
      anomalyCount > 3 && i === 0 ? 'critical' :
      intentConfidence > 0.7 && i === 0 ? 'high' :
      executionPressure > 0.7 ? 'high' : 'normal'

    return {
      taskId: `task-${i}`,
      description: goal,
      priority: Math.max(0.1, Math.min(1, basePriority)),
      urgency,
      dependsOn: i > 0 ? [`task-${i - 1}`] : [],
    }
  })
}
