/**
 * Runtime Stability Analyzer — Phase 11
 * Analyzes runtime metrics to determine stability levels and
 * identify which subsystems are degraded or at risk.
 */

export type StabilityLevel = 'stable' | 'degraded' | 'critical' | 'recovering'

export interface SubsystemHealth {
  name: string
  stability: StabilityLevel
  score: number
  issue?: string
}

export interface StabilityReport {
  overallLevel: StabilityLevel
  overallScore: number
  subsystems: SubsystemHealth[]
  riskFactors: string[]
  stabilityTrend: 'improving' | 'stable' | 'degrading'
  analyzedAt: number
}

export function analyzeRuntimeStability(input: {
  gpuUtil: number
  gpuThermalC: number
  queueDepth: number
  anomalyCount: number
  inferenceLatencyMs: number
  agentCount: number
}): StabilityReport {
  const subsystems: SubsystemHealth[] = []
  const riskFactors: string[] = []

  // GPU health
  const gpuScore = Math.max(0, 1 - (input.gpuUtil / 100) * 0.6 - (input.gpuThermalC / 100) * 0.4)
  let gpuStability: StabilityLevel = 'stable'
  if (input.gpuThermalC > 85 || input.gpuUtil > 95) { gpuStability = 'critical'; riskFactors.push('GPU thermal/utilization critical') }
  else if (input.gpuThermalC > 75 || input.gpuUtil > 80) { gpuStability = 'degraded'; riskFactors.push('GPU pressure elevated') }
  subsystems.push({ name: 'gpu-runtime', stability: gpuStability, score: Number(gpuScore.toFixed(2)) })

  // Inference queue health
  const queueScore = Math.max(0, 1 - input.queueDepth * 0.1)
  let queueStability: StabilityLevel = 'stable'
  if (input.queueDepth > 8) { queueStability = 'critical'; riskFactors.push('Inference queue saturated') }
  else if (input.queueDepth > 4) { queueStability = 'degraded'; riskFactors.push('Inference queue building') }
  subsystems.push({ name: 'inference-queue', stability: queueStability, score: Number(queueScore.toFixed(2)) })

  // Anomaly health
  const anomalyScore = Math.max(0, 1 - input.anomalyCount * 0.15)
  let anomalyStability: StabilityLevel = 'stable'
  if (input.anomalyCount > 5) { anomalyStability = 'critical'; riskFactors.push(`${input.anomalyCount} runtime anomalies detected`) }
  else if (input.anomalyCount > 2) { anomalyStability = 'degraded' }
  subsystems.push({ name: 'anomaly-watchdog', stability: anomalyStability, score: Number(anomalyScore.toFixed(2)) })

  // Latency health
  const latencyScore = Math.max(0, 1 - (input.inferenceLatencyMs / 5000) * 0.8)
  let latencyStability: StabilityLevel = 'stable'
  if (input.inferenceLatencyMs > 4000) { latencyStability = 'degraded'; riskFactors.push('Inference latency high') }
  subsystems.push({ name: 'inference-latency', stability: latencyStability, score: Number(latencyScore.toFixed(2)) })

  const avgScore = subsystems.reduce((s, sub) => s + sub.score, 0) / subsystems.length

  let overallLevel: StabilityLevel = 'stable'
  if (subsystems.some((s) => s.stability === 'critical')) overallLevel = 'critical'
  else if (subsystems.some((s) => s.stability === 'degraded')) overallLevel = 'degraded'

  const stabilityTrend = riskFactors.length === 0 ? 'stable' : riskFactors.length > 2 ? 'degrading' : 'stable'

  return {
    overallLevel,
    overallScore: Number(avgScore.toFixed(2)),
    subsystems,
    riskFactors,
    stabilityTrend,
    analyzedAt: Date.now(),
  }
}
