/**
 * Process Recovery Supervisor — Phase 11
 * Main self-healing supervisor. Combines stability analysis, resource pressure
 * management, repair execution, and crash continuity into a unified snapshot.
 */

import { analyzeRuntimeStability, type StabilityReport } from './runtimeStabilityAnalyzer'
import { assessResourcePressure, type ResourcePressureState } from './resourcePressureManager'
import { executeRuntimeRepairs, type RepairReport } from './runtimeRepairEngine'
import { loadContinuityState, saveCheckpoint, type CrashContinuityState } from './crashContinuityRuntime'

export interface ProcessHealingSnapshot {
  stability: StabilityReport
  pressure: ResourcePressureState
  repairs: RepairReport
  continuity: CrashContinuityState
  healingActive: boolean
  supervisorStatus: 'healthy' | 'monitoring' | 'repairing' | 'critical'
  checkedAt: number
}

export function runProcessRecoverySupervisor(input: {
  gpuUtil: number
  gpuThermalC: number
  vramUsedMb: number
  queueDepth: number
  anomalyCount: number
  inferenceLatencyMs: number
  agentCount: number
  workspaceId: string
  activeApps: string[]
  activeLayoutId: string
}): ProcessHealingSnapshot {
  const stability = analyzeRuntimeStability({
    gpuUtil: input.gpuUtil,
    gpuThermalC: input.gpuThermalC,
    queueDepth: input.queueDepth,
    anomalyCount: input.anomalyCount,
    inferenceLatencyMs: input.inferenceLatencyMs,
    agentCount: input.agentCount,
  })

  const pressure = assessResourcePressure({
    vramUsedMb: input.vramUsedMb,
    vramTotalMb: 8192,
    gpuUtil: input.gpuUtil,
    queueDepth: input.queueDepth,
    agentCount: input.agentCount,
  })

  const degraded = stability.subsystems
    .filter((s) => s.stability === 'degraded' || s.stability === 'critical')
    .map((s) => s.name)

  const repairs = executeRuntimeRepairs({
    degradedSubsystems: degraded,
    gpuOverloaded: stability.subsystems.find((s) => s.name === 'gpu-runtime')?.stability === 'critical',
    queueSaturated: stability.subsystems.find((s) => s.name === 'inference-queue')?.stability === 'critical',
    staleAgents: [],
  })

  // Save continuity checkpoint
  saveCheckpoint({
    workspaceId: input.workspaceId,
    activeApps: input.activeApps,
    layoutId: input.activeLayoutId,
  })

  const continuity = loadContinuityState()
  const healingActive = repairs.completedCount > 0

  let supervisorStatus: ProcessHealingSnapshot['supervisorStatus'] = 'healthy'
  if (stability.overallLevel === 'critical') supervisorStatus = 'critical'
  else if (healingActive) supervisorStatus = 'repairing'
  else if (stability.overallLevel === 'degraded') supervisorStatus = 'monitoring'

  return {
    stability,
    pressure,
    repairs,
    continuity,
    healingActive,
    supervisorStatus,
    checkedAt: Date.now(),
  }
}
