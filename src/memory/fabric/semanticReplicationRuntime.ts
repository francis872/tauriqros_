export interface MemoryReplicationState {
  replicationFactor: number
  replicatedNodes: number
  syncConfidence: number    // 0–1
  replicationLatencyMs: number
  activeReplicas: string[]
}

export function runSemanticReplication(input: {
  nodeCount: number
  peerCount: number
  syncPressure: number   // 0–1
}): MemoryReplicationState {
  const { nodeCount, peerCount, syncPressure } = input
  const factor = Math.max(1, Math.min(peerCount + 1, 3))
  const replicated = Math.round(nodeCount * (1 - syncPressure * 0.3))
  return {
    replicationFactor: factor,
    replicatedNodes: replicated,
    syncConfidence: Math.min(1, replicated / Math.max(1, nodeCount)),
    replicationLatencyMs: Math.round(10 + syncPressure * 80),
    activeReplicas: Array.from({ length: factor }, (_, i) => `replica-${i}`),
  }
}
