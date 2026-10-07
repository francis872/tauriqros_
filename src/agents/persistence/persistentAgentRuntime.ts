import { appendAgentMemory, listAgentMemory } from './adaptiveAgentMemory'
import { listAutonomousGoals } from './autonomousGoalRuntime'
import { listLongRunningTasks, registerLongRunningTask } from './longRunningTaskRuntime'
import { buildDistributedAgentContext } from './distributedAgentContext'

const PERSISTENT_AGENT_KEY = 'tauriq.persistent-agent.v1'

export interface PersistentAgentSnapshot {
  activeAgents: number
  memoryItems: number
  goals: number
  tasks: number
  restored: boolean
}

export function bootstrapPersistentAgents(peerIds: string[]): PersistentAgentSnapshot {
  let restored = false

  try {
    const raw = window.localStorage.getItem(PERSISTENT_AGENT_KEY)
    if (raw) {
      restored = true
    }
  } catch {
    restored = false
  }

  appendAgentMemory('Persistent agent runtime heartbeat initialized.')
  registerLongRunningTask('semantic-context-monitor')

  const snapshot: PersistentAgentSnapshot = {
    activeAgents: 3,
    memoryItems: listAgentMemory().length,
    goals: listAutonomousGoals().length,
    tasks: listLongRunningTasks().length,
    restored,
  }

  const distributed = buildDistributedAgentContext(peerIds)

  try {
    window.localStorage.setItem(PERSISTENT_AGENT_KEY, JSON.stringify({ snapshot, distributed, updatedAt: Date.now() }))
  } catch {
    // persistence is best-effort
  }

  return snapshot
}
