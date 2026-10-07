export interface DistributedGoal {
  goalId: string
  description: string
  ownerId: string
  collaborators: string[]
  priority: number   // 0–1
  progress: number   // 0–1
  status: 'active' | 'blocked' | 'completed' | 'delegated'
}

export interface GoalManagerState {
  activeGoals: DistributedGoal[]
  completedCount: number
  blockedCount: number
  totalProgress: number  // 0–1
}

const SYSTEM_GOALS = [
  'Maintain cognitive runtime stability',
  'Optimize inference latency',
  'Preserve workspace continuity',
  'Monitor agent cooperation health',
  'Coordinate memory fabric sync',
]

export function manageDistributedGoals(input: {
  agentIds: string[]
  executionPressure: number
  anomalyCount: number
}): GoalManagerState {
  const { agentIds, executionPressure, anomalyCount } = input
  const goals: DistributedGoal[] = SYSTEM_GOALS.map((desc, i) => {
    const progress = Math.max(0, Math.min(1, 0.3 + (5 - i) * 0.12 - executionPressure * 0.2))
    return {
      goalId: `goal-${i}`,
      description: desc,
      ownerId: agentIds[i % Math.max(1, agentIds.length)] ?? 'agent-0',
      collaborators: agentIds.slice(0, 2),
      priority: 1 - i * 0.15,
      progress,
      status: anomalyCount > 3 && i === 0 ? 'blocked' : progress > 0.8 ? 'completed' : 'active',
    }
  })
  const completed = goals.filter((g) => g.status === 'completed').length
  const blocked = goals.filter((g) => g.status === 'blocked').length
  const totalProgress = goals.reduce((s, g) => s + g.progress, 0) / goals.length
  return { activeGoals: goals, completedCount: completed, blockedCount: blocked, totalProgress }
}
