import { runSelfHealingRuntime } from './selfHealingRuntime'
import { detectRuntimeAnomalies } from './anomalyDetectionEngine'
import type { RuntimeServiceNode, RuntimeTelemetryPoint } from '../core/runtimeCoreModels'

export function runRecoverySupervisor(input: {
  services: RuntimeServiceNode[]
  telemetry: RuntimeTelemetryPoint[]
}) {
  return {
    healing: runSelfHealingRuntime(input.services),
    anomalies: detectRuntimeAnomalies(input.telemetry),
    timestamp: Date.now(),
  }
}
