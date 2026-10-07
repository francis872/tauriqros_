import { resolveCapabilities } from './capabilityManager'

export interface IsolatedAppBridge {
  appId: string
  capabilities: string[]
  bridgeReady: boolean
}

export function createIsolatedAppBridge(appId: string): IsolatedAppBridge {
  return {
    appId,
    capabilities: resolveCapabilities('app'),
    bridgeReady: true,
  }
}
