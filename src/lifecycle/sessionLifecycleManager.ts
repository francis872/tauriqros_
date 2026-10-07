import type { DaemonState } from '../daemons/daemonModels'

export interface SessionRecoveryPlan {
  shellRecoveryEnabled: boolean
  appCrashRecoveryEnabled: boolean
  workflowRecoveryEnabled: boolean
  supervisorSummary: string
}

export function buildSessionRecoveryPlan(daemons: DaemonState[]): SessionRecoveryPlan {
  const degradedCount = daemons.filter((daemon) => daemon.health === 'degraded').length

  return {
    shellRecoveryEnabled: true,
    appCrashRecoveryEnabled: true,
    workflowRecoveryEnabled: true,
    supervisorSummary: degradedCount > 0
      ? `${degradedCount} daemons degraded, recovery supervisor running in guarded mode.`
      : 'Lifecycle supervisor online with full recovery policy.',
  }
}
