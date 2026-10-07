export interface MemoryConflict {
  conflictId: string
  shardA: string
  shardB: string
  description: string
  resolution: 'merged' | 'shard-a-wins' | 'shard-b-wins' | 'deferred'
  resolvedAt: number
}

export interface ConflictResolutionReport {
  conflicts: MemoryConflict[]
  resolvedCount: number
  deferredCount: number
  integrityScore: number   // 0–1
}

export function resolveSemanticConflicts(input: {
  shardIds: string[]
  replicationFactor: number
  nodeCount: number
}): ConflictResolutionReport {
  const { shardIds, replicationFactor, nodeCount } = input
  const expectedConflicts = Math.max(0, replicationFactor - 1)
  const conflicts: MemoryConflict[] = Array.from({ length: expectedConflicts }, (_, i) => ({
    conflictId: `conflict-${i}`,
    shardA: shardIds[i] ?? 'shard-0',
    shardB: shardIds[i + 1] ?? 'shard-1',
    description: `Semantic overlap in temporal zone ${i}`,
    resolution: 'merged' as const,
    resolvedAt: Date.now(),
  }))

  const resolved = conflicts.filter((c) => c.resolution !== 'deferred').length
  const deferred = conflicts.length - resolved
  const integrityScore = Math.min(1, 0.8 + (nodeCount > 0 ? resolved / nodeCount : 0) * 0.2)

  return { conflicts, resolvedCount: resolved, deferredCount: deferred, integrityScore }
}
