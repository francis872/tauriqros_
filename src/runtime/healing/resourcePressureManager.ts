/**
 * Resource Pressure Manager — Phase 11
 * Monitors and manages resource pressure (memory, GPU, inference queue, agents).
 * Generates mitigation recommendations when pressure thresholds are exceeded.
 */

export type PressureLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical'

export interface ResourcePressureState {
  memory: PressureLevel
  gpu: PressureLevel
  inferenceQueue: PressureLevel
  agentMesh: PressureLevel
  combined: PressureLevel
  mitigations: string[]
  pressureScore: number
}

function toPressureLevel(ratio: number): PressureLevel {
  if (ratio < 0.4) return 'none'
  if (ratio < 0.6) return 'low'
  if (ratio < 0.75) return 'moderate'
  if (ratio < 0.9) return 'high'
  return 'critical'
}

export function assessResourcePressure(input: {
  vramUsedMb: number
  vramTotalMb: number
  gpuUtil: number
  queueDepth: number
  agentCount: number
}): ResourcePressureState {
  const vramTotal = input.vramTotalMb > 0 ? input.vramTotalMb : 8192
  const memRatio = input.vramUsedMb / vramTotal
  const gpuRatio = input.gpuUtil / 100
  const queueRatio = Math.min(1, input.queueDepth / 10)
  const agentRatio = Math.min(1, input.agentCount / 8)

  const memory = toPressureLevel(memRatio)
  const gpu = toPressureLevel(gpuRatio)
  const inferenceQueue = toPressureLevel(queueRatio)
  const agentMesh = toPressureLevel(agentRatio)

  const pressureScore = Number(
    ((memRatio + gpuRatio + queueRatio + agentRatio) / 4).toFixed(2),
  )

  const mitigations: string[] = []
  if (memory === 'high' || memory === 'critical') mitigations.push('Compress vector memory — run memory defrag')
  if (gpu === 'high' || gpu === 'critical') mitigations.push('Reduce inference batch size — throttle GPU scheduler')
  if (inferenceQueue === 'high' || inferenceQueue === 'critical') mitigations.push('Drain inference queue — cancel low-priority jobs')
  if (agentMesh === 'high') mitigations.push('Suspend non-critical agents')

  const combined = toPressureLevel(pressureScore)

  return {
    memory,
    gpu,
    inferenceQueue,
    agentMesh,
    combined,
    mitigations,
    pressureScore,
  }
}
