export interface AgentMemoryRecord {
  id: string
  insight: string
  timestamp: number
}

const agentMemory: AgentMemoryRecord[] = []

export function appendAgentMemory(insight: string) {
  const record: AgentMemoryRecord = {
    id: `agent-memory-${Date.now()}-${agentMemory.length + 1}`,
    insight,
    timestamp: Date.now(),
  }
  agentMemory.unshift(record)
  return record
}

export function listAgentMemory() {
  return [...agentMemory].slice(0, 48)
}
