export interface VectorRoute {
  shardId: string
  vectorDimension: number
  routingScore: number   // 0–1
  latencyMs: number
  selected: boolean
}

export interface VectorRoutingTable {
  routes: VectorRoute[]
  tableSize: number
  routingStrategy: 'nearest-neighbor' | 'load-balanced' | 'semantic-weighted'
  selectedRoute: string
}

export function buildVectorMemoryRoutes(input: {
  shardIds: string[]
  vectorDimension: number
  queryEmbeddingNorm: number   // 0–1
}): VectorRoutingTable {
  const { shardIds, vectorDimension, queryEmbeddingNorm } = input
  const routes: VectorRoute[] = shardIds.map((id, i) => {
    const score = Math.max(0.1, queryEmbeddingNorm - i * 0.08)
    return {
      shardId: id,
      vectorDimension,
      routingScore: score,
      latencyMs: Math.round(2 + (1 - score) * 20),
      selected: i === 0,
    }
  })

  const best = routes.reduce((b, r) => r.routingScore > b.routingScore ? r : b, routes[0])
  routes.forEach((r) => { r.selected = r.shardId === best.shardId })

  return {
    routes,
    tableSize: routes.length,
    routingStrategy: queryEmbeddingNorm > 0.7 ? 'semantic-weighted' : 'nearest-neighbor',
    selectedRoute: best.shardId,
  }
}
