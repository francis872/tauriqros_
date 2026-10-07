/**
 * Adaptive Model Selection — Phase 11
 * Selects the optimal model for a given query based on task type,
 * resource availability, and current runtime state.
 */

import { getProfileForTask, getProfileByRole, type ModelProfile, type ModelRole } from './contextualModelProfiles'

export interface ModelSelectionResult {
  selectedProfile: ModelProfile
  selectionReason: string
  alternateRole: ModelRole
  resourceFeasible: boolean
  expectedLatencyMs: number
}

export function selectAdaptiveModel(input: {
  queryText: string
  gpuUtil: number
  vramUsedMb: number
  queueDepth: number
  preferLocalOnly: boolean
}): ModelSelectionResult {
  const taskProfile = getProfileForTask(input.queryText)

  // Check if preferred profile is feasible given current resources
  const estimatedVramAvailable = 8192 - input.vramUsedMb
  const resourceFeasible = estimatedVramAvailable >= taskProfile.vramRequiredMb && input.gpuUtil < 90

  let selectedProfile = taskProfile
  let selectionReason = `Task-matched profile: ${taskProfile.role} (${taskProfile.modelId})`
  let alternateRole: ModelRole = 'fast-local'

  if (!resourceFeasible) {
    if (input.preferLocalOnly) {
      // Fall back to fast-local which uses least VRAM
      selectedProfile = getProfileByRole('fast-local')
      selectionReason = `Resource-constrained fallback to ${selectedProfile.modelId} (insufficient VRAM or GPU saturated)`
      alternateRole = taskProfile.role
    } else {
      selectedProfile = getProfileByRole('cloud-fallback')
      selectionReason = `Local GPU saturated — routing to cloud fallback`
      alternateRole = taskProfile.role
    }
  } else if (input.queueDepth > 5) {
    selectedProfile = getProfileByRole('fast-local')
    selectionReason = `Queue depth ${input.queueDepth} — using fast-local to reduce latency`
    alternateRole = taskProfile.role
  }

  const queueDelayMs = input.queueDepth * 150
  const expectedLatencyMs = selectedProfile.avgLatencyMs + queueDelayMs

  return {
    selectedProfile,
    selectionReason,
    alternateRole,
    resourceFeasible,
    expectedLatencyMs,
  }
}
