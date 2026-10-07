import { buildWorkspaceMutations } from './contextualWorkspaceMutation'
import { predictWorkspaceTransitions } from './predictiveWorkspaceTransitions'
import { computeAdaptiveWorkspaceZones } from './adaptiveWorkspaceZones'
import { loadSemanticWorkspaceMemory } from './semanticWorkspaceMemory'
import { loadAllContinuityContexts, computeContinuityScore } from './continuityWorkspaceEngine'

export type EvolutionPhase = 'stable' | 'mutating' | 'transitioning' | 'optimized'

export interface WorkspaceEvolutionSnapshot {
  evolutionPhase: EvolutionPhase
  activeZones: string[]
  continuityScore: number
  focusFlowRating: number
  mutationCount: number
  restoredContexts: number
  semanticAnchorCount: number
  predictedNextTransition: string
  evolutionPressure: number
  mutations: ReturnType<typeof buildWorkspaceMutations>
  transitions: ReturnType<typeof predictWorkspaceTransitions>
  updatedAt: number
}

export function runEvolutionaryWorkspaceRuntime(input: {
  workspaceId: string
  dominantPattern: string
  predictedPattern: string
  intentConfidence: number
  executionPressure: number
  healingActive: boolean
  uiPressure: 'low' | 'moderate' | 'high'
}): WorkspaceEvolutionSnapshot {
  const { workspaceId: _workspaceId, dominantPattern, predictedPattern, intentConfidence, executionPressure, healingActive, uiPressure } = input

  const mutations = buildWorkspaceMutations({ dominantPattern, intentConfidence, executionPressure, previousMutationCount: 2 })
  const transitions = predictWorkspaceTransitions({ currentPattern: dominantPattern, predictedPattern, intentConfidence, timeElapsedMs: Date.now() % (1000 * 60 * 60), executionPressure })
  const zones = computeAdaptiveWorkspaceZones({ dominantPattern, uiPressure, healingActive })
  const memory = loadSemanticWorkspaceMemory()
  const continuityContexts = loadAllContinuityContexts()
  const continuityScore = computeContinuityScore(continuityContexts)

  const mutationCount = mutations.length
  const evolutionPressure = Math.min(1, mutationCount * 0.2 + transitions.length * 0.15 + executionPressure * 0.3)

  let evolutionPhase: EvolutionPhase = 'stable'
  if (mutationCount > 2 || transitions.length > 1) evolutionPhase = 'mutating'
  else if (transitions.length > 0) evolutionPhase = 'transitioning'
  else if (continuityScore > 0.7 && executionPressure < 0.3) evolutionPhase = 'optimized'

  return {
    evolutionPhase,
    activeZones: zones.map((z) => z.label),
    continuityScore,
    focusFlowRating: Math.min(1, continuityScore * 0.5 + intentConfidence * 0.5),
    mutationCount,
    restoredContexts: continuityContexts.length,
    semanticAnchorCount: memory.totalAnchorCount,
    predictedNextTransition: transitions[0]?.toState ?? 'stable',
    evolutionPressure,
    mutations,
    transitions,
    updatedAt: Date.now(),
  }
}
