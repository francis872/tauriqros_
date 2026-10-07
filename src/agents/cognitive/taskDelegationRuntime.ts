export interface DelegatedTask {
  task: string
  assignedTo: string
  confidence: number
}

export function delegateAgentTasks(tasks: string[], agents: string[]): DelegatedTask[] {
  return tasks.map((task, index) => ({
    task,
    assignedTo: agents[index % Math.max(1, agents.length)] ?? 'supervisor',
    confidence: Number((0.72 + (index % 3) * 0.06).toFixed(2)),
  }))
}
