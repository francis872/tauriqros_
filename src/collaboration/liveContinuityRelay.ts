export function relayLiveContinuity(sourceDevice: string, peers: string[]) {
  return {
    sourceDevice,
    delivered: peers.length,
    channels: peers.map((peer) => `${sourceDevice}->${peer}`),
  }
}
