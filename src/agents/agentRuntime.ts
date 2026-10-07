import { defaultAgentTaskGraph } from './agentTaskGraph'
import { superviseAgents } from './agentSupervisor'
import { runWorkflowRecoveryAgent } from './workflowRecoveryAgent'
import { runContinuityAgent } from './continuityAgent'
import { buildProactiveAssistantHint } from './proactiveAssistant'
import type { SessionContinuitySnapshot } from '../persistence/sessionStateRepository'

export interface AgentRuntimeSnapshot {
  health: ReturnType<typeof superviseAgents>
  recovery: ReturnType<typeof runWorkflowRecoveryAgent>
  continuity: ReturnType<typeof runContinuityAgent>
  proactiveHint: string
}

export function bootstrapAgentRuntime(snapshot: SessionContinuitySnapshot): AgentRuntimeSnapshot {
  const graph = defaultAgentTaskGraph()

  return {
    health: superviseAgents(graph),
    recovery: runWorkflowRecoveryAgent(snapshot),
    continuity: runContinuityAgent(snapshot),
    proactiveHint: buildProactiveAssistantHint(snapshot),
  }
}
