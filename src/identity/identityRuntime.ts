import { resolveDeviceIdentity } from '../ecosystem/deviceIdentityRuntime'
import { invokeNativeSafe } from '../services/tauriBridge'

const SESSION_TOKEN_KEY = 'tauriq.session-token.v1'

export interface IdentityRuntimeSnapshot {
  userId: string
  sessionId: string
  deviceId: string
  tokenIssuedAt: number
}

export async function bootstrapIdentityRuntime(userId: string): Promise<IdentityRuntimeSnapshot> {
  const device = resolveDeviceIdentity()

  const token = await invokeNativeSafe<{ token: string; issuedAt: number }>(
    'security_issue_session_token',
    { userId, deviceId: device.id },
    () => ({ token: `local-${Date.now()}`, issuedAt: Date.now() }),
  )

  const snapshot: IdentityRuntimeSnapshot = {
    userId,
    sessionId: token.token,
    deviceId: device.id,
    tokenIssuedAt: token.issuedAt,
  }

  try {
    window.localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore storage failures.
  }

  return snapshot
}
