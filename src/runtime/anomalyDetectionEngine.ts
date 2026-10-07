import type { RuntimeTelemetryPoint } from '../core/runtimeCoreModels'

export function detectRuntimeAnomalies(points: RuntimeTelemetryPoint[]) {
  const latest = points[0]
  if (!latest) {
    return [] as string[]
  }

  const anomalies: string[] = []

  if (latest.cpuLoad > 85) {
    anomalies.push('CPU saturation anomaly detected')
  }

  if (latest.memoryLoad > 88) {
    anomalies.push('Memory pressure anomaly detected')
  }

  if (latest.degradedServices > 1) {
    anomalies.push('Multiple degraded services anomaly detected')
  }

  return anomalies
}
