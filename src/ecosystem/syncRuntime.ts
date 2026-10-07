import type { DeviceIdentity } from './deviceIdentityRuntime'

export interface SyncSnapshot {
  peersDiscovered: number
  encryptedChannel: boolean
  syncedDomains: Array<'sessions' | 'workflows' | 'memory' | 'notifications' | 'files' | 'contexts'>
  lastSyncAt: number
}

export function buildSyncSnapshot(device: DeviceIdentity): SyncSnapshot {
  return {
    peersDiscovered: device.trust === 'verified' ? 1 : 0,
    encryptedChannel: device.trust === 'verified',
    syncedDomains: ['sessions', 'workflows', 'memory', 'notifications', 'contexts'],
    lastSyncAt: Date.now() - 1000 * 60 * 7,
  }
}
