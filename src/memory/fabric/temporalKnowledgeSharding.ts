export type TimeWindow = 'session' | 'day' | 'week' | 'month' | 'permanent'

export interface TemporalShard {
  shardId: string
  window: TimeWindow
  nodeCount: number
  semanticTags: string[]
  createdAt: number
  expiresAt: number | null
}

function windowToMs(w: TimeWindow): number | null {
  switch (w) {
    case 'session': return 1000 * 60 * 60 * 4
    case 'day': return 1000 * 60 * 60 * 24
    case 'week': return 1000 * 60 * 60 * 24 * 7
    case 'month': return 1000 * 60 * 60 * 24 * 30
    case 'permanent': return null
  }
}

export function shardTemporalKnowledge(input: {
  totalNodes: number
  dominantPattern: string
}): TemporalShard[] {
  const { totalNodes, dominantPattern } = input
  const windows: TimeWindow[] = ['session', 'day', 'week', 'month', 'permanent']
  return windows.map((w, i) => {
    const ttl = windowToMs(w)
    const sliceSize = Math.round(totalNodes * [0.15, 0.25, 0.25, 0.20, 0.15][i])
    return {
      shardId: `shard-${w}`,
      window: w,
      nodeCount: sliceSize,
      semanticTags: [dominantPattern, `tier-${i}`].filter(Boolean),
      createdAt: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : null,
    }
  })
}
