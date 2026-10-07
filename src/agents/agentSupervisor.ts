import type { AgentTaskNode } from './agentTaskGraph'

export interface AgentHealth {
  status: 'healthy' | 'guarded'
  activeAgents: number
  pausedAgents: number
}

export function superviseAgents(graph: AgentTaskNode[]): AgentHealth {
  const activeAgents = graph.filter((node) => node.status === 'running').length
  const pausedAgents = graph.filter((node) => node.status === 'paused').length

  return {
    status: pausedAgents > 0 ? 'guarded' : 'healthy',
    activeAgents,
    pausedAgents,
  }
}
