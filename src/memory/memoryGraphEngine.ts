import type { WorkspaceId } from '../workspace/workspaceModels'

const MEMORY_KEY = 'tauriq.memory-graph.v1'

export interface MemoryNode {
  id: string
  type: 'project' | 'workflow' | 'habit' | 'priority' | 'task'
  title: string
  workspaceId: WorkspaceId
  updatedAt: number
}

export interface MemoryGraphSnapshot {
  nodes: MemoryNode[]
  lastRecall: string
  updatedAt: number
}

export function defaultMemoryGraph(): MemoryGraphSnapshot {
  const now = Date.now()

  return {
    nodes: [
      { id: 'project-tauriq', type: 'project', title: 'TAURIQ OS Runtime Core', workspaceId: 'development', updatedAt: now },
      { id: 'workflow-compositor', type: 'workflow', title: 'Wayland compositor preparation', workspaceId: 'development', updatedAt: now },
      { id: 'task-infra', type: 'task', title: 'Finalize runtime supervision APIs', workspaceId: 'development', updatedAt: now },
      { id: 'habit-review', type: 'habit', title: 'Morning architecture review', workspaceId: 'research', updatedAt: now },
    ],
    lastRecall: 'You were working on the TAURIQ compositor architecture yesterday.',
    updatedAt: now,
  }
}

export function loadMemoryGraph(): MemoryGraphSnapshot {
  try {
    const raw = window.localStorage.getItem(MEMORY_KEY)
    if (!raw) {
      const fallback = defaultMemoryGraph()
      window.localStorage.setItem(MEMORY_KEY, JSON.stringify(fallback))
      return fallback
    }

    return JSON.parse(raw) as MemoryGraphSnapshot
  } catch {
    return defaultMemoryGraph()
  }
}

export function saveMemoryGraph(snapshot: MemoryGraphSnapshot) {
  try {
    window.localStorage.setItem(
      MEMORY_KEY,
      JSON.stringify({
        ...snapshot,
        updatedAt: Date.now(),
      }),
    )
  } catch {
    // Ignore persistence failures.
  }
}

export function memoryContinuityInsights(snapshot: MemoryGraphSnapshot) {
  const unfinished = snapshot.nodes.filter((node) => node.type === 'task' || node.type === 'workflow').length
  return {
    recall: snapshot.lastRecall,
    unfinished,
    priorities: snapshot.nodes.filter((node) => node.type === 'priority').map((node) => node.title),
  }
}
