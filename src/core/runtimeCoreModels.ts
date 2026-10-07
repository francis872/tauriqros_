export type RuntimeServiceState = 'ready' | 'starting' | 'degraded' | 'failed'

export interface RuntimeServiceNode {
  id: string
  title: string
  critical: boolean
  dependencies: string[]
  state: RuntimeServiceState
  restarts: number
  lastHeartbeat: number
}

export interface RuntimeTelemetryPoint {
  timestamp: number
  cpuLoad: number
  memoryLoad: number
  aiQueueDepth: number
  degradedServices: number
}

export interface UnifiedRuntimeState {
  status: 'healthy' | 'guarded' | 'critical'
  services: RuntimeServiceNode[]
  telemetry: RuntimeTelemetryPoint[]
  recoveryActions: string[]
  startedAt: number
}
