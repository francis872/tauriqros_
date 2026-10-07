import { buildPeerInferenceMesh } from './peerInferenceMesh'

export function routeDistributedInference(input: {
  peerIds: string[]
  queueDepth: number
}) {
  const mesh = buildPeerInferenceMesh(input.peerIds)

  return {
    mesh,
    distributedEnabled: mesh.peers.length > 0 && input.queueDepth > 1,
    selectedPeer: mesh.peers[0] ?? null,
  }
}
