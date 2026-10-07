import type { UserIdentityProfile } from '../profiles/profileModels'
import type { WorkspaceId } from '../workspace/workspaceModels'
import type { DaemonState } from '../daemons/daemonModels'
import { bootstrapBackgroundDaemons } from '../daemons/daemonRuntime'
import {
  loadContinuitySnapshot,
  saveContinuitySnapshot,
  type SessionContinuitySnapshot,
} from '../persistence/sessionStateRepository'
import { buildAiContinuityInsight, type AiContinuityInsight } from '../intelligence/aiContinuityRuntime'
import { invokeNativeSafe } from '../services/tauriBridge'

export interface SessionBootstrapResult {
  daemons: DaemonState[]
  continuity: SessionContinuitySnapshot
  aiInsight: AiContinuityInsight
  nativeLifecycle: 'native' | 'fallback'
}

export async function bootstrapSessionRuntime(input: {
  profile: UserIdentityProfile
  activeWorkspaceId: WorkspaceId
  restoredWindows: number
}): Promise<SessionBootstrapResult> {
  const continuity = loadContinuitySnapshot(input.activeWorkspaceId)

  const daemonResult = await bootstrapBackgroundDaemons({
    preferredWorkspace: input.profile.preferredWorkspace,
    activeWorkspace: continuity.lastWorkspaceId,
    restoredWindows: input.restoredWindows,
  })

  const native = await invokeNativeSafe<{ status: 'native' | 'fallback' }>(
    'session_runtime_bootstrap',
    {
      workspace: continuity.lastWorkspaceId,
      unfinishedWorkflows: continuity.workflows.length,
    },
    () => ({ status: 'fallback' }),
  )

  const aiInsight = buildAiContinuityInsight(input.profile, continuity)

  saveContinuitySnapshot({
    ...continuity,
    lastWorkspaceId: input.activeWorkspaceId,
    updatedAt: Date.now(),
  })

  return {
    daemons: daemonResult.daemons,
    continuity,
    aiInsight,
    nativeLifecycle: native.status,
  }
}
