export function runSemanticSync(peers: string[], revision: number) {
  return {
    peers: peers.length,
    revision,
    drift: peers.length > 1 ? 'low' : 'none',
  }
}
