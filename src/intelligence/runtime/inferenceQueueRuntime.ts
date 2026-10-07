export type InferencePriority = 'critical' | 'high' | 'normal' | 'low'

export interface InferenceQueueItem {
  id: string
  prompt: string
  modelId: string
  priority: InferencePriority
  enqueuedAt: number
}

const queue: InferenceQueueItem[] = []

const priorityWeight: Record<InferencePriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
}

export function enqueueInferenceItem(input: Omit<InferenceQueueItem, 'id' | 'enqueuedAt'>) {
  const item: InferenceQueueItem = {
    id: `iq-${Date.now()}-${queue.length + 1}`,
    enqueuedAt: Date.now(),
    ...input,
  }
  queue.push(item)
  queue.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || a.enqueuedAt - b.enqueuedAt)
  return item
}

export function dequeueInferenceItem() {
  return queue.shift() ?? null
}

export function getInferenceQueueSnapshot() {
  return {
    depth: queue.length,
    items: [...queue],
  }
}

export function cancelInferenceItem(id: string) {
  const index = queue.findIndex((item) => item.id === id)
  if (index < 0) {
    return false
  }
  queue.splice(index, 1)
  return true
}
