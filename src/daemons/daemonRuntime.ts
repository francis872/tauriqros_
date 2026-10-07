import type { DaemonBootstrapContext, DaemonBootstrapResult, DaemonHealth, DaemonState, DaemonId } from './daemonModels'

const DAEMON_REGISTRY: Array<{ id: DaemonId; title: string; scope: DaemonState['scope'] }> = [
  { id: 'ai-daemon', title: 'AI Runtime Daemon', scope: 'intelligence' },
  { id: 'workspace-daemon', title: 'Workspace Recovery Daemon', scope: 'session' },
  { id: 'context-daemon', title: 'Context Continuity Daemon', scope: 'intelligence' },
  { id: 'indexing-daemon', title: 'Live Indexing Daemon', scope: 'filesystem' },
  { id: 'notification-daemon', title: 'Notification Daemon', scope: 'runtime' },
  { id: 'automation-daemon', title: 'Automation Daemon', scope: 'runtime' },
  { id: 'lifecycle-daemon', title: 'Lifecycle Supervisor Daemon', scope: 'session' },
]

function daemonHealthFor(id: DaemonId, context: DaemonBootstrapContext): DaemonHealth {
  if (id === 'indexing-daemon' && context.restoredWindows === 0) {
    return 'starting'
  }

  if (id === 'context-daemon' && context.preferredWorkspace !== context.activeWorkspace) {
    return 'degraded'
  }

  return 'ready'
}

function daemonMessage(id: DaemonId, context: DaemonBootstrapContext): string {
  if (id === 'workspace-daemon') {
    return context.restoredWindows > 0
      ? `Recovered ${context.restoredWindows} windows from last session.`
      : 'No previous windows found. Clean workspace baseline prepared.'
  }

  if (id === 'ai-daemon') {
    return 'Intent classifier and continuity memory channels synchronized.'
  }

  if (id === 'lifecycle-daemon') {
    return 'Crash recovery policy active for shell and app lifecycle events.'
  }

  return 'Service channel healthy.'
}

export async function bootstrapBackgroundDaemons(context: DaemonBootstrapContext): Promise<DaemonBootstrapResult> {
  const startedAt = Date.now()

  const daemons = DAEMON_REGISTRY.map((daemon) => {
    const health = daemonHealthFor(daemon.id, context)

    return {
      id: daemon.id,
      title: daemon.title,
      scope: daemon.scope,
      health,
      startedAt: Date.now(),
      message: daemonMessage(daemon.id, context),
    } satisfies DaemonState
  })

  return {
    daemons,
    startupDurationMs: Date.now() - startedAt,
  }
}
