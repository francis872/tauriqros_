export type SandboxCapability = 'filesystem-read' | 'filesystem-write' | 'network' | 'telemetry' | 'ai'

export function resolveCapabilities(target: 'app' | 'plugin' | 'agent'): SandboxCapability[] {
  if (target === 'plugin') {
    return ['filesystem-read', 'telemetry']
  }

  if (target === 'agent') {
    return ['filesystem-read', 'network', 'ai', 'telemetry']
  }

  return ['filesystem-read', 'filesystem-write', 'network', 'telemetry', 'ai']
}
