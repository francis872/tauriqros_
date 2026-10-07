export function optimizeStreamingPerformance(input: { queueDepth: number; peers: number }) {
  return {
    backpressure: input.queueDepth > 3 ? 'high' : 'normal',
    relayMode: input.peers > 1 ? 'mesh' : 'direct',
  }
}
