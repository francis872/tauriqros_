export interface LatencyCompensation {
  compensationMs: number
  strategy: 'buffering' | 'predictive-prefetch' | 'speculative-exec' | 'passthrough'
  effectiveLatencyMs: number
  compensationActive: boolean
}

export function computeLatencyCompensation(input: {
  baseLatencyMs: number
  queueDepth: number
  inferenceLatencyMs: number
}): LatencyCompensation {
  const { baseLatencyMs, queueDepth, inferenceLatencyMs } = input
  const targetLatencyMs = 50
  const total = baseLatencyMs + inferenceLatencyMs * 0.1 + queueDepth * 5
  const excess = Math.max(0, total - targetLatencyMs)

  let strategy: LatencyCompensation['strategy'] = 'passthrough'
  if (excess > 200) strategy = 'speculative-exec'
  else if (excess > 100) strategy = 'predictive-prefetch'
  else if (excess > 30) strategy = 'buffering'

  const compensation = strategy === 'speculative-exec' ? excess * 0.7 :
    strategy === 'predictive-prefetch' ? excess * 0.5 :
    strategy === 'buffering' ? excess * 0.3 : 0

  return {
    compensationMs: Math.round(compensation),
    strategy,
    effectiveLatencyMs: Math.max(targetLatencyMs, Math.round(total - compensation)),
    compensationActive: compensation > 0,
  }
}
