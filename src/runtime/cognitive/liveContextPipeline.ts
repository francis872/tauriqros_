export interface ContextPipelineFrame {
  id: string
  source: string
  payload: string
  at: number
}

export function buildLiveContextPipeline(input: {
  memoryRecall: string
  activeWorkflow: string
  retrievalPreview: string
}) {
  const now = Date.now()

  const frames: ContextPipelineFrame[] = [
    { id: `ctx-${now}-1`, source: 'memory', payload: input.memoryRecall, at: now - 2000 },
    { id: `ctx-${now}-2`, source: 'workflow', payload: input.activeWorkflow, at: now - 1200 },
    { id: `ctx-${now}-3`, source: 'retrieval', payload: input.retrievalPreview, at: now - 450 },
  ]

  return {
    frames,
    flowRate: Number((frames.length / 2.5).toFixed(2)),
  }
}
