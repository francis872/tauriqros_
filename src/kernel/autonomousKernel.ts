import { computeCognitiveHeartbeat } from './cognitiveHeartbeat'
import { assessRuntimeConsciousness } from './runtimeConsciousness'
import { runPredictiveExecutionLoop } from './predictiveExecutionLoop'
import { runAdaptiveDecisionCore } from './adaptiveDecisionCore'
import { transitionKernelState, getKernelState, getTransitionHistory } from './autonomousStateMachine'

export type AutonomyLevel =
  | 'minimal'
  | 'assisted'
  | 'collaborative'
  | 'autonomous'
  | 'fully-autonomous'

export interface KernelSnapshot {
  cognitionScore: number
  autonomyLevel: AutonomyLevel
  proactiveConfidence: number
  executionPressure: number
  adaptiveState: ReturnType<typeof getKernelState>
  heartbeat: ReturnType<typeof computeCognitiveHeartbeat>
  consciousness: ReturnType<typeof assessRuntimeConsciousness>
  executionLoop: ReturnType<typeof runPredictiveExecutionLoop>
  decision: ReturnType<typeof runAdaptiveDecisionCore>
  recentTransitions: ReturnType<typeof getTransitionHistory>
  lastDecision: string
  nextScheduledAction: string
  cycleCount: number
  updatedAt: number
}

function resolveAutonomyLevel(score: number): AutonomyLevel {
  if (score > 0.9) return 'fully-autonomous'
  if (score > 0.75) return 'autonomous'
  if (score > 0.55) return 'collaborative'
  if (score > 0.35) return 'assisted'
  return 'minimal'
}

export function runAutonomousKernel(input: {
  queueDepth: number
  anomalyCount: number
  intentConfidence: number
  healingActive: boolean
  activeWorkflows: number
  thermalC?: number
  activeSubsystems?: number
  autonomyEnabled?: boolean
}): KernelSnapshot {
  const {
    queueDepth,
    anomalyCount,
    intentConfidence,
    healingActive,
    activeWorkflows,
    thermalC = 55,
    activeSubsystems = 12,
    autonomyEnabled = true,
  } = input

  const executionPressure = Math.min(1, queueDepth * 0.08 + anomalyCount * 0.12 + Math.max(0, thermalC - 65) * 0.015)
  const baseAutonomy = autonomyEnabled ? Math.min(1, intentConfidence * 0.5 + (1 - executionPressure) * 0.3 + activeWorkflows * 0.05) : 0.1
  const autonomyLevelEnum = resolveAutonomyLevel(baseAutonomy)

  const heartbeat = computeCognitiveHeartbeat({ queueDepth, anomalyCount, thermalC })
  const consciousness = assessRuntimeConsciousness({ activeSubsystems, intentConfidence, healingActive, queueDepth })
  const executionLoop = runPredictiveExecutionLoop({ intentConfidence, activeWorkflows, anomalyCount, autonomyLevel: baseAutonomy })
  const decision = runAdaptiveDecisionCore({ executionPressure, healingActive, intentConfidence, autonomyLevel: baseAutonomy, anomalyCount })

  const adaptiveState = transitionKernelState('kernel-cycle', {
    anomalyCount,
    healingActive,
    executionPressure,
    intentConfidence,
  })

  const cognitionScore = Math.min(1,
    intentConfidence * 0.35 +
    (1 - executionPressure) * 0.25 +
    consciousness.depth * 0.25 +
    baseAutonomy * 0.15,
  )

  return {
    cognitionScore,
    autonomyLevel: autonomyLevelEnum,
    proactiveConfidence: decision.confidence,
    executionPressure,
    adaptiveState,
    heartbeat,
    consciousness,
    executionLoop,
    decision,
    recentTransitions: getTransitionHistory(),
    lastDecision: decision.appliedAdaptations[0] ?? 'observe',
    nextScheduledAction: executionLoop.scheduledActions[0] ?? executionLoop.proactiveOperations[0] ?? 'idle',
    cycleCount: executionLoop.cycleId,
    updatedAt: Date.now(),
  }
}
