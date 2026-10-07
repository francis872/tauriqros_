import type { WorkspaceId } from '../../workspace/workspaceModels'

const SEMANTIC_MEMORY_KEY = 'tauriq.semantic-memory.v1'

export interface SemanticMemoryNode {
  id: string
  label: string
  kind: 'project' | 'workflow' | 'conversation' | 'file' | 'goal' | 'habit' | 'runtime'
  workspaceId: WorkspaceId
  tags: string[]
  score: number
  updatedAt: number
}

export interface SemanticMemoryEdge {
  source: string
  target: string
  relation: 'depends-on' | 'references' | 'evolved-into' | 'related-to' | 'triggered-by'
  weight: number
}

export interface SemanticGraphSnapshot {
  nodes: SemanticMemoryNode[]
  edges: SemanticMemoryEdge[]
  updatedAt: number
}

export function createDefaultSemanticGraph(): SemanticGraphSnapshot {
  const now = Date.now()
  return {
    nodes: [
      { id: 'project-tauriq', label: 'TAURIQ Runtime Core', kind: 'project', workspaceId: 'development', tags: ['runtime', 'architecture'], score: 0.95, updatedAt: now },
      { id: 'workflow-phase8', label: 'Autonomous cognitive platform rollout', kind: 'workflow', workspaceId: 'research', tags: ['phase8', 'cognitive'], score: 0.92, updatedAt: now - 1000 * 60 * 18 },
      { id: 'goal-mesh', label: 'Stabilize distributed cognition mesh', kind: 'goal', workspaceId: 'ai', tags: ['mesh', 'agents'], score: 0.88, updatedAt: now - 1000 * 60 * 42 },
      { id: 'runtime-healing', label: 'Self-healing supervisor policy', kind: 'runtime', workspaceId: 'development', tags: ['recovery', 'supervisor'], score: 0.85, updatedAt: now - 1000 * 60 * 60 },
    ],
    edges: [
      { source: 'workflow-phase8', target: 'project-tauriq', relation: 'depends-on', weight: 0.91 },
      { source: 'goal-mesh', target: 'workflow-phase8', relation: 'related-to', weight: 0.82 },
      { source: 'runtime-healing', target: 'goal-mesh', relation: 'triggered-by', weight: 0.76 },
    ],
    updatedAt: now,
  }
}

export function loadSemanticGraph(): SemanticGraphSnapshot {
  try {
    const raw = window.localStorage.getItem(SEMANTIC_MEMORY_KEY)
    if (!raw) {
      const fallback = createDefaultSemanticGraph()
      saveSemanticGraph(fallback)
      return fallback
    }
    return JSON.parse(raw) as SemanticGraphSnapshot
  } catch {
    return createDefaultSemanticGraph()
  }
}

export function saveSemanticGraph(snapshot: SemanticGraphSnapshot) {
  try {
    window.localStorage.setItem(
      SEMANTIC_MEMORY_KEY,
      JSON.stringify({ ...snapshot, updatedAt: Date.now() }),
    )
  } catch {
    // Best effort persistence.
  }
}
