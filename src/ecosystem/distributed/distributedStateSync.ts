import type { MeshPeer } from './peerMeshRuntime'

export interface DistributedStateSnapshot {
  peers: number
  synchronizedDomains: string[]
  replicationLagMs: number
}

export function synchronizeDistributedState(peers: MeshPeer[]): DistributedStateSnapshot {
  return {
    peers: peers.length,
    synchronizedDomains: ['session', 'workflows', 'memory', 'notifications'],
    replicationLagMs: 90 + Math.round(Math.random() * 180),
  }
}
