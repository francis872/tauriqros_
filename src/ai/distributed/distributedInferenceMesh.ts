/**
 * Distributed Inference Mesh — Phase 11
 * Manages coordination of multiple AI models running simultaneously.
 * Routes different query types to specialized models and aggregates results.
 */

import type { ModelProfile } from './contextualModelProfiles'
import { MODEL_PROFILES } from './contextualModelProfiles'

export interface MeshNode {
  nodeId: string
  modelId: string
  role: ModelProfile['role']
  status: 'active' | 'idle' | 'overloaded' | 'offline'
  queueDepth: number
  throughputTps: number
}

export interface DistributedMeshSnapshot {
  nodes: MeshNode[]
  activeNodes: number
  totalCapacityTps: number
  meshLatencyMs: number
  routingTable: Record<string, string>
  meshHealth: 'healthy' | 'degraded' | 'partitioned'
}

export function buildDistributedInferenceMesh(input: {
  peerCount: number
  localGpuUtil: number
  localQueueDepth: number
}): DistributedMeshSnapshot {
  // Local nodes based on available profiles
  const localNodes: MeshNode[] = MODEL_PROFILES.filter((p) => p.role !== 'cloud-fallback').map((p) => ({
    nodeId: `local:${p.modelId}`,
    modelId: p.modelId,
    role: p.role,
    status: (input.localGpuUtil > 90 ? 'overloaded' : 'active') as MeshNode['status'],
    queueDepth: Math.floor(input.localQueueDepth / 3),
    throughputTps: Math.max(1, Math.round((1000 / p.avgLatencyMs) * (1 - input.localGpuUtil / 200))),
  }))

  // Peer nodes (one per peer)
  const peerNodes: MeshNode[] = Array.from({ length: input.peerCount }, (_, i) => ({
    nodeId: `peer:${i + 1}`,
    modelId: 'qwen',
    role: 'reasoning' as ModelProfile['role'],
    status: 'active' as MeshNode['status'],
    queueDepth: 0,
    throughputTps: 8,
  }))

  const nodes = [...localNodes, ...peerNodes]
  const activeNodes = nodes.filter((n) => n.status === 'active').length
  const totalCapacityTps = nodes.reduce((s, n) => s + n.throughputTps, 0)

  const routingTable: Record<string, string> = {
    'fast-local': 'local:phi3',
    'reasoning': 'local:qwen',
    'memory': 'local:llama3',
    'cloud-fallback': 'cloud:overflow',
  }

  const meshHealth = activeNodes === 0
    ? 'partitioned'
    : activeNodes < nodes.length / 2
    ? 'degraded'
    : 'healthy'

  return {
    nodes,
    activeNodes,
    totalCapacityTps,
    meshLatencyMs: Math.max(50, 200 - input.peerCount * 20),
    routingTable,
    meshHealth,
  }
}
