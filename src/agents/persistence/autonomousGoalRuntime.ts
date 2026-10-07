export interface AutonomousGoal {
  id: string
  title: string
  progress: number
  status: 'active' | 'paused' | 'completed'
}

const goals: AutonomousGoal[] = [
  { id: 'goal-runtime-stability', title: 'Maintain runtime execution stability', progress: 0.72, status: 'active' },
  { id: 'goal-rag-index', title: 'Expand semantic retrieval index', progress: 0.51, status: 'active' },
]

export function listAutonomousGoals() {
  return goals
}

export function updateGoalProgress(goalId: string, progress: number) {
  const goal = goals.find((item) => item.id === goalId)
  if (!goal) {
    return null
  }
  goal.progress = Math.max(0, Math.min(1, progress))
  goal.status = goal.progress >= 1 ? 'completed' : goal.status
  return goal
}
