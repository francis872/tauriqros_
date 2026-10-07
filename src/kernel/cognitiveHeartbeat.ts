export interface HeartbeatState {
  hz: number
  lastBeatMs: number
  beatCount: number
  jitterMs: number
  stable: boolean
}

export function computeCognitiveHeartbeat(input: {
  queueDepth: number
  anomalyCount: number
  thermalC?: number
}): HeartbeatState {
  const { queueDepth, anomalyCount, thermalC = 55 } = input
  const basHz = 10
  const pressure = Math.min(1, (queueDepth * 0.1 + anomalyCount * 0.2 + Math.max(0, thermalC - 60) * 0.01))
  const hz = Math.round(basHz - pressure * 6)
  const jitterMs = Math.round(pressure * 15)
  return {
    hz: Math.max(1, hz),
    lastBeatMs: Date.now(),
    beatCount: Math.floor(Date.now() / 1000) % 10000,
    jitterMs,
    stable: pressure < 0.4,
  }
}
