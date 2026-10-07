import { buildTaskChain } from './taskChainEngine'
import { prioritizeExecution } from './contextualExecutionPlanner'
import { adaptWorkflowPlan } from './adaptiveWorkflowPlanner'

export function runAutonomousPlanner(input: {
  seed: string
  queueDepth: number
  anomalies: number
}) {
  const chain = buildTaskChain(input.seed)
  const prioritized = prioritizeExecution(chain, input.queueDepth)
  const adapted = adaptWorkflowPlan(prioritized, input.anomalies)

  return {
    chain: adapted,
    recommendedNext: adapted[0]?.label ?? 'No tasks available',
  }
}
