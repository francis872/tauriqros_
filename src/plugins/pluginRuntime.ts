export interface PluginManifest {
  id: string
  name: string
  version: string
  permissions: string[]
}

export function loadPluginManifests(): PluginManifest[] {
  return [
    {
      id: 'tauriq.runtime-inspector',
      name: 'Runtime Inspector',
      version: '0.1.0',
      permissions: ['telemetry.read', 'runtime.read'],
    },
  ]
}
