export type AgentRole = 'coordinator' | 'executor' | 'analyst' | 'memory' | 'planner' | 'healer' | 'observer'

export interface AgentNode {
  id: string
  role: AgentRole
  level: number       // hierarchy depth
  parentId: string | null
  childIds: string[]
  influenceScore: number   // 0–1
  trustScore: number       // 0–1
  specialization: string
}

export interface HierarchicalAgentGraph {
  nodes: AgentNode[]
  root: string
  hierarchyDepth: number
  totalInfluence: number
}

const AGENT_TEMPLATES: Array<Omit<AgentNode, 'id'>> = [
  { role: 'coordinator', level: 0, parentId: null, childIds: ['exec-1', 'plan-1', 'mem-1'], influenceScore: 0.95, trustScore: 0.90, specialization: 'orchestration' },
  { role: 'executor', level: 1, parentId: 'coord-0', childIds: ['obs-1'], influenceScore: 0.75, trustScore: 0.85, specialization: 'task-execution' },
  { role: 'planner', level: 1, parentId: 'coord-0', childIds: [], influenceScore: 0.80, trustScore: 0.88, specialization: 'goal-decomposition' },
  { role: 'memory', level: 1, parentId: 'coord-0', childIds: [], influenceScore: 0.70, trustScore: 0.92, specialization: 'context-recall' },
  { role: 'analyst', level: 2, parentId: 'exec-1', childIds: [], influenceScore: 0.65, trustScore: 0.80, specialization: 'intent-analysis' },
  { role: 'healer', level: 2, parentId: 'exec-1', childIds: [], influenceScore: 0.72, trustScore: 0.87, specialization: 'runtime-repair' },
  { role: 'observer', level: 2, parentId: 'obs-1', childIds: [], influenceScore: 0.55, trustScore: 0.78, specialization: 'telemetry-monitoring' },
]

export function buildHierarchicalAgentGraph(agentCount: number): HierarchicalAgentGraph {
  const count = Math.min(agentCount, AGENT_TEMPLATES.length)
  const nodes: AgentNode[] = AGENT_TEMPLATES.slice(0, Math.max(3, count)).map((t, i) => ({
    ...t,
    id: `agent-${t.role}-${i}`,
  }))
  const totalInfluence = nodes.reduce((s, n) => s + n.influenceScore, 0) / nodes.length
  return {
    nodes,
    root: nodes[0].id,
    hierarchyDepth: Math.max(...nodes.map((n) => n.level)) + 1,
    totalInfluence,
  }
}
