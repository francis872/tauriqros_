const DEVICE_ID_KEY = 'tauriq.device-id.v1'

export interface DeviceIdentity {
  id: string
  name: string
  trust: 'verified' | 'unverified'
}

function generateDeviceId() {
  return `tq-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`
}

export function resolveDeviceIdentity(): DeviceIdentity {
  try {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY)
    if (existing) {
      return JSON.parse(existing) as DeviceIdentity
    }

    const created: DeviceIdentity = {
      id: generateDeviceId(),
      name: 'TAURIQ Primary Device',
      trust: 'verified',
    }

    window.localStorage.setItem(DEVICE_ID_KEY, JSON.stringify(created))
    return created
  } catch {
    return {
      id: 'tq-fallback-device',
      name: 'TAURIQ Fallback Device',
      trust: 'unverified',
    }
  }
}
