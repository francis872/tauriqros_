import { getDesktopLifecycleBlueprint } from '../orchestration/desktopLifecycleManager'

export interface RuntimeProcess {
  id: string
  status: 'running' | 'idle' | 'degraded'
  category: 'session' | 'automation' | 'indexing' | 'ai'
}

export interface RuntimeEngineSnapshot {
  timestamp: number
  lifecycle: ReturnType<typeof getDesktopLifecycleBlueprint>
  processes: RuntimeProcess[]
}

export function createRuntimeEngineSnapshot(): RuntimeEngineSnapshot {
  return {
    timestamp: Date.now(),
    lifecycle: getDesktopLifecycleBlueprint(),
    processes: [
      { id: 'session-runtime-manager', status: 'running', category: 'session' },
      { id: 'workflow-scheduler', status: 'running', category: 'automation' },
      { id: 'filesystem-indexer', status: 'idle', category: 'indexing' },
      { id: 'local-model-router', status: 'idle', category: 'ai' },
    ],
  }
}
