const STORAGE_KEY = 'tauriq:semantic-workspace-memory.v1'

export interface WorkspaceMemoryEntry {
  workspaceId: string
  pattern: string
  lastVisited: number
  visitCount: number
  semanticTags: string[]
  focusScore: number  // 0–1
}

export interface SemanticWorkspaceMemory {
  entries: WorkspaceMemoryEntry[]
  totalAnchorCount: number
  lastUpdated: number
}

export function loadSemanticWorkspaceMemory(): SemanticWorkspaceMemory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as SemanticWorkspaceMemory
  } catch { /* ignore */ }
  return { entries: [], totalAnchorCount: 0, lastUpdated: Date.now() }
}

export function recordWorkspaceMemory(input: {
  workspaceId: string
  pattern: string
  tags: string[]
}): void {
  const mem = loadSemanticWorkspaceMemory()
  const existing = mem.entries.find((e) => e.workspaceId === input.workspaceId)
  if (existing) {
    existing.visitCount++
    existing.lastVisited = Date.now()
    existing.semanticTags = [...new Set([...existing.semanticTags, ...input.tags])]
    existing.focusScore = Math.min(1, existing.focusScore + 0.05)
  } else {
    mem.entries.push({
      workspaceId: input.workspaceId,
      pattern: input.pattern,
      lastVisited: Date.now(),
      visitCount: 1,
      semanticTags: input.tags,
      focusScore: 0.5,
    })
  }
  mem.totalAnchorCount = mem.entries.reduce((s, e) => s + e.semanticTags.length, 0)
  mem.lastUpdated = Date.now()
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mem)) } catch { /* ignore */ }
}
