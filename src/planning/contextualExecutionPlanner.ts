import type { PlannedTask } from './taskChainEngine'

export function prioritizeExecution(tasks: PlannedTask[], queueDepth: number): PlannedTask[] {
  const queuePenalty = queueDepth > 2 ? 0.15 : 0

  return [...tasks].sort((a, b) => {
    const rank = (task: PlannedTask) => {
      if (task.priority === 'critical') return 3
      if (task.priority === 'high') return 2
      return 1
    }
    return (rank(b) - rank(a)) - queuePenalty
  })
}
