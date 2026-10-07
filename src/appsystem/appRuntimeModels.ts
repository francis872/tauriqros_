export type AppPermission = 'filesystem' | 'network' | 'notifications' | 'ai' | 'device-control'

export interface TauriqAppManifest {
  id: string
  name: string
  version: string
  capabilities: AppPermission[]
  background: boolean
  sandboxed: boolean
}

export interface AppRuntimeState {
  appId: string
  lifecycle: 'starting' | 'running' | 'suspended'
  permissionsGranted: AppPermission[]
}
