import { buildHierarchicalAgentGraph, type HierarchicalAgentGraph } from './hierarchicalAgentGraph'
import { runAutonomousDelegationEngine, type DelegationEngineState } from './autonomousDelegationEngine'
import { buildCooperativePlan, type CooperativePlan } from './cooperativePlanningRuntime'
import { runConsensusRound, type ConsensusRound } from './consensusEngine'
import { manageDistributedGoals, type GoalManagerState } from './distributedGoalManager'
import { buildAgentPersonalities, type PersonalityProfile } from './adaptiveAgentPersonality'

export interface AgentSocietySnapshot {
  agentCount: number
  hierarchyDepth: number
  delegationActive: boolean
  consensusReached: boolean
  cooperationEfficiency: number
  coordinationLatencyMs: number
  activeGoals: string[]
  trustScores: Record<string, number>
  dominantPersonality: string
  votingActive: boolean
  graph: HierarchicalAgentGraph
  delegation: DelegationEngineState
  plan: CooperativePlan
  consensus: ConsensusRound
  goals: GoalManagerState
  personalities: PersonalityProfile[]
  updatedAt: number
}

export function runAgentSociety(input: {
  agentCount: number
  activeGoals: string[]
  executionPressure: number
  anomalyCount: number
  intentConfidence: number
}): AgentSocietySnapshot {
  const { agentCount, activeGoals, executionPressure, anomalyCount, intentConfidence } = input

  const graph = buildHierarchicalAgentGraph(agentCount)
  const agentIds = graph.nodes.map((n) => n.id)
  const trustScores: Record<string, number> = {}
  graph.nodes.forEach((n) => { trustScores[n.id] = n.trustScore })

  const delegation = runAutonomousDelegationEngine({ activeGoals, agentIds, workloadPressure: executionPressure })
  const plan = buildCooperativePlan({ agentIds, primaryGoal: activeGoals[0] ?? 'maintain-stability', cooperationEfficiency: intentConfidence })
  const consensus = runConsensusRound({ topic: activeGoals[0] ?? 'optimize-runtime', agentIds, approvalBias: intentConfidence })
  const goals = manageDistributedGoals({ agentIds, executionPressure, anomalyCount })
  const personalities = buildAgentPersonalities({ agentIds, workloadPressure: executionPressure, anomalyCount })

  const cooperationEfficiency = Math.min(1,
    graph.totalInfluence * 0.4 +
    plan.cooperationScore * 0.3 +
    consensus.consensusScore * 0.3,
  )

  const dominantPersonality = personalities.reduce((best, p) =>
    p.adaptationRate > (best?.adaptationRate ?? 0) ? p : best, personalities[0])?.personality ?? 'collaborative'

  return {
    agentCount: graph.nodes.length,
    hierarchyDepth: graph.hierarchyDepth,
    delegationActive: delegation.delegationActive,
    consensusReached: consensus.outcome === 'approved',
    cooperationEfficiency,
    coordinationLatencyMs: delegation.delegationLatencyMs,
    activeGoals: goals.activeGoals.map((g) => g.description).slice(0, 3),
    trustScores,
    dominantPersonality,
    votingActive: consensus.quorumReached,
    graph,
    delegation,
    plan,
    consensus,
    goals,
    personalities,
    updatedAt: Date.now(),
  }
}
