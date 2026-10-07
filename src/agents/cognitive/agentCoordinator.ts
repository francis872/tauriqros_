import { delegateAgentTasks } from './taskDelegationRuntime'

export function coordinateAgents(input: { tasks: string[]; agents: string[] }) {
  const delegation = delegateAgentTasks(input.tasks, input.agents)

  return {
    delegation,
    activeCoordinations: delegation.length,
  }
}
