import type { PlannedTask } from './taskChainEngine'

export function adaptWorkflowPlan(tasks: PlannedTask[], anomalies: number) {
  if (anomalies <= 0) {
    return tasks
  }

  return [
    {
      id: 'runtime-recovery-gate',
      label: 'Run recovery gate before autonomous tasks',
      priority: 'critical' as const,
    },
    ...tasks,
  ]
}
