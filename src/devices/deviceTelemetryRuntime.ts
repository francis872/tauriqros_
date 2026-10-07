import type { WorkspaceId } from '../workspace/workspaceModels'

export interface DeviceTelemetrySnapshot {
  battery: number
  cpu: number
  gpu: number
  thermalC: number
  audioDevice: string
  bluetooth: 'enabled' | 'disabled'
  network: 'online' | 'offline'
  storageUsed: number
  monitors: number
  workspaceAffinity: WorkspaceId
}

export function captureDeviceTelemetry(workspaceAffinity: WorkspaceId): DeviceTelemetrySnapshot {
  return {
    battery: 58 + Math.floor(Math.random() * 36),
    cpu: 25 + Math.floor(Math.random() * 55),
    gpu: 12 + Math.floor(Math.random() * 70),
    thermalC: 44 + Math.floor(Math.random() * 35),
    audioDevice: 'PipeWire Default Sink',
    bluetooth: Math.random() > 0.5 ? 'enabled' : 'disabled',
    network: navigator.onLine ? 'online' : 'offline',
    storageUsed: 37 + Math.floor(Math.random() * 40),
    monitors: 1,
    workspaceAffinity,
  }
}
