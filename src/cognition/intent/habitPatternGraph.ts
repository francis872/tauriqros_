/**
 * Habit Pattern Graph — Phase 11
 * Directed graph structure for storing and querying behavioral habit patterns.
 * Tracks app transitions, workflow sequences, and temporal usage habits.
 */

export interface HabitNode {
  id: string
  label: string
  appId: string
  frequency: number
  lastTriggered: number
  contextTags: string[]
}

export interface HabitEdge {
  source: string
  target: string
  transitionCount: number
  avgDelayMs: number
}

export interface HabitPatternGraph {
  nodes: HabitNode[]
  edges: HabitEdge[]
  updatedAt: number
}

export function createHabitPatternGraph(): HabitPatternGraph {
  return { nodes: [], edges: [], updatedAt: Date.now() }
}

export function recordHabitTransition(
  graph: HabitPatternGraph,
  fromAppId: string,
  toAppId: string,
): HabitPatternGraph {
  const now = Date.now()
  const fromId = `habit:${fromAppId}`
  const toId = `habit:${toAppId}`

  const nodes = graph.nodes.map((n) => ({ ...n }))

  for (const [id, appId] of [[fromId, fromAppId], [toId, toAppId]] as [string, string][]) {
    const existing = nodes.find((n) => n.id === id)
    if (existing) {
      existing.frequency++
      existing.lastTriggered = now
    } else {
      nodes.push({ id, label: appId, appId, frequency: 1, lastTriggered: now, contextTags: [] })
    }
  }

  const edges = graph.edges.map((e) => ({ ...e }))
  const existingEdge = edges.find((e) => e.source === fromId && e.target === toId)
  if (existingEdge) {
    existingEdge.transitionCount++
  } else {
    edges.push({ source: fromId, target: toId, transitionCount: 1, avgDelayMs: 0 })
  }

  return { nodes, edges, updatedAt: now }
}

export function getTopNodes(graph: HabitPatternGraph, limit = 5): HabitNode[] {
  return [...graph.nodes]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit)
}

export function getOutgoingEdges(graph: HabitPatternGraph, appId: string): HabitEdge[] {
  const nodeId = `habit:${appId}`
  return graph.edges.filter((e) => e.source === nodeId)
}
