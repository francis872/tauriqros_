import type { AppPermission, TauriqAppManifest } from './appRuntimeModels'

export function getDefaultManifest(appId: string): TauriqAppManifest {
  return {
    id: appId,
    name: appId.toUpperCase(),
    version: '1.0.0',
    capabilities: ['filesystem', 'notifications'],
    background: false,
    sandboxed: true,
  }
}

export function resolveGrantedPermissions(manifest: TauriqAppManifest): AppPermission[] {
  if (!manifest.sandboxed) {
    return manifest.capabilities
  }

  return manifest.capabilities.filter((permission) => permission !== 'device-control')
}
