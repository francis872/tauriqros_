import type { SemanticGraphSnapshot } from '../../memory/semantic/semanticGraphEngine'
import { coordinateAgents } from './agentCoordinator'
import { runAgentPlanning } from './autonomousPlanningEngine'
import { runRuntimeOptimizationAgent } from './runtimeOptimizationAgent'
import { runWorkflowArchitectAgent } from './workflowArchitectAgent'
import { runSemanticResearchAgent } from './semanticResearchAgent'

const DEFAULT_AGENT_POOL = ['supervisor', 'optimizer', 'architect', 'researcher']

export function bootstrapCognitiveAgentMesh(input: {
  semanticGraph: SemanticGraphSnapshot
  queueDepth: number
  anomalies: number
  battery: number
}) {
  const tasks = [
    'stabilize runtime graph',
    'forecast next workspace',
    'optimize inference queue',
    'refresh semantic memory index',
  ]

  return {
    coordination: coordinateAgents({ tasks, agents: DEFAULT_AGENT_POOL }),
    planning: runAgentPlanning('cognitive-mesh', input.queueDepth, input.anomalies),
    optimization: runRuntimeOptimizationAgent({
      queueDepth: input.queueDepth,
      anomalies: input.anomalies,
      battery: input.battery,
    }),
    architect: runWorkflowArchitectAgent('continue-architecture-session'),
    research: runSemanticResearchAgent(input.semanticGraph, 'runtime'),
  }
}
