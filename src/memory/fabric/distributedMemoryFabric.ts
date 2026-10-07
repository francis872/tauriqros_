import { runSemanticReplication } from './semanticReplicationRuntime'
import { compressMemoryFabric } from './memoryCompressionEngine'
import { shardTemporalKnowledge } from './temporalKnowledgeSharding'
import { buildVectorMemoryRoutes } from './vectorMemoryRouter'
import { resolveSemanticConflicts } from './semanticConflictResolver'

export interface MemoryFabricSnapshot {
  nodeCount: number
  replicationFactor: number
  memoryIntegrityScore: number
  syncConfidence: number
  semanticDensity: number
  fragmentationLevel: number
  activeShards: number
  compressionRatio: number
  conflictsResolved: number
  routingTableSize: number
  replication: ReturnType<typeof runSemanticReplication>
  compression: ReturnType<typeof compressMemoryFabric>
  shards: ReturnType<typeof shardTemporalKnowledge>
  routing: ReturnType<typeof buildVectorMemoryRoutes>
  conflictReport: ReturnType<typeof resolveSemanticConflicts>
  updatedAt: number
}

export function buildDistributedMemoryFabric(input: {
  nodeCount: number
  peerCount: number
  vramUsedMb: number
  syncPressure: number
  dominantPattern: string
}): MemoryFabricSnapshot {
  const { nodeCount, peerCount, vramUsedMb, syncPressure, dominantPattern } = input

  const replication = runSemanticReplication({ nodeCount, peerCount, syncPressure })
  const compression = compressMemoryFabric({ nodeCount, vramUsedMb, pressureScore: syncPressure })
  const shards = shardTemporalKnowledge({ totalNodes: nodeCount, dominantPattern })
  const shardIds = shards.map((s) => s.shardId)
  const routing = buildVectorMemoryRoutes({ shardIds, vectorDimension: 768, queryEmbeddingNorm: replication.syncConfidence })
  const conflictReport = resolveSemanticConflicts({ shardIds, replicationFactor: replication.replicationFactor, nodeCount })

  const semanticDensity = Math.min(1, nodeCount / 1000)
  const fragmentationLevel = Math.min(1, conflictReport.deferredCount * 0.1 + syncPressure * 0.3)

  return {
    nodeCount: compression.compressedNodes,
    replicationFactor: replication.replicationFactor,
    memoryIntegrityScore: conflictReport.integrityScore,
    syncConfidence: replication.syncConfidence,
    semanticDensity,
    fragmentationLevel,
    activeShards: shards.length,
    compressionRatio: compression.compressionRatio,
    conflictsResolved: conflictReport.resolvedCount,
    routingTableSize: routing.tableSize,
    replication,
    compression,
    shards,
    routing,
    conflictReport,
    updatedAt: Date.now(),
  }
}
