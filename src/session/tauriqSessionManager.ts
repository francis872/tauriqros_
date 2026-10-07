import type { UserIdentityProfile } from '../profiles/profileModels'
import type { WorkspaceId } from '../workspace/workspaceModels'
import { bootstrapSessionRuntime } from '../bootstrap/sessionBootstrapEngine'
import { buildSessionRecoveryPlan, type SessionRecoveryPlan } from '../lifecycle/sessionLifecycleManager'
import type { DaemonState } from '../daemons/daemonModels'
import type { SessionContinuitySnapshot } from '../persistence/sessionStateRepository'
import type { AiContinuityInsight } from '../intelligence/aiContinuityRuntime'
import { orchestrateCoreRuntime, type CoreRuntimeSnapshot } from '../core/coreRuntimeOrchestrator'

export interface TauriqSessionRuntimeSnapshot {
  daemons: DaemonState[]
  continuity: SessionContinuitySnapshot
  aiInsight: AiContinuityInsight
  recovery: SessionRecoveryPlan
  nativeLifecycle: 'native' | 'fallback'
  core: CoreRuntimeSnapshot
}

export async function initializeTauriqSession(input: {
  profile: UserIdentityProfile
  activeWorkspaceId: WorkspaceId
  restoredWindows: number
}): Promise<TauriqSessionRuntimeSnapshot> {
  const bootstrap = await bootstrapSessionRuntime(input)
  const core = await orchestrateCoreRuntime({
    workspaceId: input.activeWorkspaceId,
    activeApps: ['files', 'terminal', 'notes', 'ai', 'settings', 'monitor'],
    userId: input.profile.id,
  })

  return {
    daemons: bootstrap.daemons,
    continuity: bootstrap.continuity,
    aiInsight: bootstrap.aiInsight,
    recovery: buildSessionRecoveryPlan(bootstrap.daemons),
    nativeLifecycle: bootstrap.nativeLifecycle,
    core,
  }
}
