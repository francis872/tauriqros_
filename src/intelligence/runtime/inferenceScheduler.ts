import { getModelCapability } from '../models/modelCapabilityRegistry'

export interface InferenceJob {
  id: string
  prompt: string
  modelId: string
  priority: 'high' | 'normal' | 'background'
  createdAt: number
}

let queue: InferenceJob[] = []

export function enqueueInference(job: Omit<InferenceJob, 'id' | 'createdAt'>) {
  const next: InferenceJob = {
    ...job,
    id: `inf-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    createdAt: Date.now(),
  }

  queue = [...queue, next].sort((a, b) => {
    const aWeight = a.priority === 'high' ? 3 : a.priority === 'normal' ? 2 : 1
    const bWeight = b.priority === 'high' ? 3 : b.priority === 'normal' ? 2 : 1
    return bWeight - aWeight
  })

  return next
}

export function nextInferenceJob(memoryPressure: number) {
  if (queue.length === 0) {
    return null
  }

  const candidate = queue.find((job) => {
    const capability = getModelCapability(job.modelId)
    if (!capability) {
      return true
    }

    return memoryPressure < capability.memoryCostMb
  }) ?? queue[0]

  queue = queue.filter((job) => job.id !== candidate.id)
  return candidate
}

export function inferenceQueueSize() {
  return queue.length
}
