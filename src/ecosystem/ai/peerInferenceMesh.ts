export function buildPeerInferenceMesh(peerIds: string[]) {
  return {
    peers: peerIds,
    routes: peerIds.map((peerId, index) => ({
      peerId,
      routeWeight: Number((0.7 + index * 0.04).toFixed(2)),
      status: 'ready' as const,
    })),
  }
}
