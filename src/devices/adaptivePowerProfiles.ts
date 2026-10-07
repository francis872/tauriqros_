import type { DeviceTelemetrySnapshot } from './deviceTelemetryRuntime'

export type PowerProfile = 'performance' | 'balanced' | 'silent'

export function selectAdaptivePowerProfile(snapshot: DeviceTelemetrySnapshot): PowerProfile {
  if (snapshot.battery < 30 || snapshot.thermalC > 72) {
    return 'silent'
  }

  if (snapshot.cpu > 70 || snapshot.gpu > 75) {
    return 'performance'
  }

  return 'balanced'
}
