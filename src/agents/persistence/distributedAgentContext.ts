export function buildDistributedAgentContext(peers: string[]) {
  return {
    peers,
    contextReplicas: peers.map((peer) => ({
      peer,
      status: 'synchronized' as const,
    })),
  }
}
