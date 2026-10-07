import { computePredictiveInterfaceState } from './predictiveInterfaceRuntime'
import { generateSemanticLayout, type SemanticLayout } from './semanticLayoutGenerator'
import { generateProactiveSuggestions, type ProactiveSuggestion } from './proactiveUiSuggestions'

export interface PredictiveUiSnapshot {
  interfaceState: ReturnType<typeof computePredictiveInterfaceState>
  layout: SemanticLayout
  suggestions: ProactiveSuggestion[]
  activeWorkflowPanel: string | null
  suggestedComponents: string[]
  uiPressure: 'low' | 'moderate' | 'high'
  semanticDensity: number
  updatedAt: number
}

export function buildPredictiveUiRuntime(input: {
  dominantPattern: string
  intentConfidence: number
  anomalyCount: number
  healingActive: boolean
  activeWorkflowCount: number
  activeWorkflows: string[]
}): PredictiveUiSnapshot {
  const { dominantPattern, intentConfidence, anomalyCount, healingActive, activeWorkflowCount, activeWorkflows } = input

  const interfaceState = computePredictiveInterfaceState({
    dominantPattern,
    anomalyCount,
    intentConfidence,
    activeWorkflowCount,
    healingActive,
  })

  const layout = generateSemanticLayout({
    dominantPattern,
    uiPressure: interfaceState.uiPressure,
    activeWorkflowCount,
  })

  const suggestions = generateProactiveSuggestions({
    dominantPattern,
    intentConfidence,
    uiPressure: interfaceState.uiPressure,
    healingActive,
    activeWorkflowCount,
  })

  const suggestedComponents: string[] = []
  if (anomalyCount > 0) suggestedComponents.push('HealingStatePanel')
  if (intentConfidence > 0.6) suggestedComponents.push('IntentGraphView')
  if (activeWorkflowCount > 0) suggestedComponents.push('WorkflowStream')
  suggestedComponents.push('CognitiveOverlay')

  return {
    interfaceState,
    layout,
    suggestions,
    activeWorkflowPanel: activeWorkflows[0] ?? null,
    suggestedComponents,
    uiPressure: interfaceState.uiPressure,
    semanticDensity: layout.densityScore,
    updatedAt: Date.now(),
  }
}
