import type { AppRuntimeState } from './appRuntimeModels'
import { getDefaultManifest, resolveGrantedPermissions } from './permissionRuntime'

export function bootAppRuntime(appIds: string[]): AppRuntimeState[] {
  return appIds.map((appId) => {
    const manifest = getDefaultManifest(appId)

    return {
      appId,
      lifecycle: 'running',
      permissionsGranted: resolveGrantedPermissions(manifest),
    }
  })
}
