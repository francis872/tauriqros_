import { buildSelfExecutingChains } from './selfExecutingTaskChains'
import { mutateWorkflows } from './intelligentWorkflowMutation'
import { executeGoalsPredictively } from './predictiveGoalExecution'
import { recoverWorkflows, type WorkflowHealth } from './workflowRecoveryIntelligence'
import { prioritizeTasks } from './adaptiveTaskPrioritizer'

export interface AutonomousWorkflowSnapshot {
  activeChains: number
  completedChains: number
  recoveredChains: number
  mutatedPlans: number
  reprioritizedGoals: number
  executionEfficiency: number
  currentGoal: string
  nextPredictedAction: string
  autonomousRunning: boolean
  workflowHealth: WorkflowHealth
  chains: ReturnType<typeof buildSelfExecutingChains>
  mutations: ReturnType<typeof mutateWorkflows>
  goalExecutions: ReturnType<typeof executeGoalsPredictively>
  recovery: ReturnType<typeof recoverWorkflows>
  prioritizedTasks: ReturnType<typeof prioritizeTasks>
  updatedAt: number
}

export function runAutonomousWorkflowRuntime(input: {
  activeGoals: string[]
  autonomyLevel: number
  executionPressure: number
  anomalyCount: number
  intentConfidence: number
}): AutonomousWorkflowSnapshot {
  const { activeGoals, autonomyLevel, executionPressure, anomalyCount, intentConfidence } = input

  const chains = buildSelfExecutingChains({ activeGoals, autonomyLevel, executionPressure })
  const mutations = mutateWorkflows({ goals: activeGoals, anomalyCount, executionPressure })
  const goalExecutions = executeGoalsPredictively({ activeGoals, intentConfidence, autonomyLevel })
  const failedChainCount = chains.filter((c) => c.status === 'failed').length
  const recovery = recoverWorkflows({ failedChainCount, anomalyCount, executionPressure })
  const prioritizedTasks = prioritizeTasks({ goals: activeGoals, executionPressure, anomalyCount, intentConfidence })

  const completedChains = chains.filter((c) => c.status === 'completed').length
  const activeChains = chains.filter((c) => c.status === 'running').length
  const executionEfficiency = chains.length > 0
    ? chains.reduce((s, c) => s + c.completionRatio, 0) / chains.length
    : 0

  return {
    activeChains,
    completedChains,
    recoveredChains: recovery.recoveredChains,
    mutatedPlans: mutations.length,
    reprioritizedGoals: prioritizedTasks.filter((t) => t.urgency === 'critical' || t.urgency === 'high').length,
    executionEfficiency,
    currentGoal: prioritizedTasks[0]?.description ?? 'idle',
    nextPredictedAction: goalExecutions[0]?.executionPath[goalExecutions[0].executionPath.length - 1] ?? 'observe',
    autonomousRunning: autonomyLevel > 0.5 && activeChains > 0,
    workflowHealth: recovery.health,
    chains,
    mutations,
    goalExecutions,
    recovery,
    prioritizedTasks,
    updatedAt: Date.now(),
  }
}
