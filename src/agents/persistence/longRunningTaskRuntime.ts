export interface LongRunningTask {
  id: string
  label: string
  startedAt: number
  state: 'running' | 'recovering' | 'idle'
}

const longRunningTasks: LongRunningTask[] = []

export function registerLongRunningTask(label: string) {
  const task: LongRunningTask = {
    id: `lrt-${Date.now()}-${longRunningTasks.length + 1}`,
    label,
    startedAt: Date.now(),
    state: 'running',
  }
  longRunningTasks.unshift(task)
  return task
}

export function listLongRunningTasks() {
  return [...longRunningTasks].slice(0, 12)
}
