import { SYSTEM_CONTROL_CAPABILITIES } from '../system/systemControlPlan'

export type SystemControlAction = 'shutdown' | 'restart' | 'sleep' | 'lock'

export function listSystemControlCapabilities() {
  return SYSTEM_CONTROL_CAPABILITIES
}

export function queueSystemControlAction(action: SystemControlAction) {
  return {
    id: `control-${action}-${Date.now()}`,
    action,
    status: 'queued' as const,
    scheduledAt: Date.now(),
  }
}
