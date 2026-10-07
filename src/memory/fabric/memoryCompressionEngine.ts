export interface CompressionResult {
  originalNodes: number
  compressedNodes: number
  compressionRatio: number   // 0–1 (0 = no compression, 1 = maximum)
  freedMb: number
  strategy: 'lossless' | 'semantic-dedupe' | 'temporal-prune'
}

export function compressMemoryFabric(input: {
  nodeCount: number
  vramUsedMb: number
  pressureScore: number   // 0–1
}): CompressionResult {
  const { nodeCount, vramUsedMb, pressureScore } = input
  const strategy: CompressionResult['strategy'] =
    pressureScore > 0.7 ? 'temporal-prune' :
    pressureScore > 0.4 ? 'semantic-dedupe' :
    'lossless'

  const ratio = strategy === 'temporal-prune' ? 0.45 :
    strategy === 'semantic-dedupe' ? 0.25 : 0.08

  return {
    originalNodes: nodeCount,
    compressedNodes: Math.round(nodeCount * (1 - ratio)),
    compressionRatio: ratio,
    freedMb: Math.round(vramUsedMb * ratio * 0.15),
    strategy,
  }
}
