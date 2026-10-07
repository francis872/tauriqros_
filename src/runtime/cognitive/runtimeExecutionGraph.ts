export interface RuntimeExecutionNode {
  id: string
  label: string
  load: number
}

export function buildRuntimeExecutionGraph(input: {
  queueDepth: number
  activeAgents: number
  retrievalHits: number
}) {
  const nodes: RuntimeExecutionNode[] = [
    { id: 'inference-queue', label: 'Inference Queue', load: input.queueDepth },
    { id: 'agent-runtime', label: 'Persistent Agents', load: input.activeAgents },
    { id: 'retrieval', label: 'RAG Retrieval', load: input.retrievalHits },
  ]

  return {
    nodes,
    edges: [
      { source: 'inference-queue', target: 'agent-runtime' },
      { source: 'agent-runtime', target: 'retrieval' },
    ],
  }
}
