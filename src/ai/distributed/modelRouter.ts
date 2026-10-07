/**
 * Model Router — Phase 11
 * Main entry point for the distributed model mesh.
 * Combines adaptive selection, load balancing, and mesh coordination
 * into a unified routing snapshot.
 */

import { selectAdaptiveModel, type ModelSelectionResult } from './adaptiveModelSelection'
import { balanceInferenceLoad, type LoadBalancerState } from './inferenceLoadBalancer'
import { buildDistributedInferenceMesh, type DistributedMeshSnapshot } from './distributedInferenceMesh'

export interface ModelRoutingSnapshot {
  selection: ModelSelectionResult
  loadBalancer: LoadBalancerState
  mesh: DistributedMeshSnapshot
  activeModelId: string
  routingStrategy: string
  meshEnabled: boolean
  updatedAt: number
}

export function routeModelInference(input: {
  queryText: string
  gpuUtil: number
  gpuThermalC: number
  vramUsedMb: number
  queueDepth: number
  peerCount: number
  preferLocalOnly?: boolean
}): ModelRoutingSnapshot {
  const selection = selectAdaptiveModel({
    queryText: input.queryText,
    gpuUtil: input.gpuUtil,
    vramUsedMb: input.vramUsedMb,
    queueDepth: input.queueDepth,
    preferLocalOnly: input.preferLocalOnly ?? true,
  })

  const loadBalancer = balanceInferenceLoad({
    queueDepth: input.queueDepth,
    gpuUtil: input.gpuUtil,
    gpuThermalC: input.gpuThermalC,
    peerCount: input.peerCount,
  })

  const mesh = buildDistributedInferenceMesh({
    peerCount: input.peerCount,
    localGpuUtil: input.gpuUtil,
    localQueueDepth: input.queueDepth,
  })

  const meshEnabled = input.peerCount > 0 && mesh.meshHealth !== 'partitioned'

  return {
    selection,
    loadBalancer,
    mesh,
    activeModelId: selection.selectedProfile.modelId,
    routingStrategy: loadBalancer.strategy,
    meshEnabled,
    updatedAt: Date.now(),
  }
}
