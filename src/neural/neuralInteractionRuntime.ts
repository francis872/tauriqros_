import { predictNextInput } from './predictiveInputEngine'
import { computeGestureContext } from './contextualGestureRuntime'
import { learnInteractionPatterns } from './adaptiveInteractionPatterns'
import { buildCognitiveShortcuts } from './cognitiveShortcutEngine'
import { predictSemanticCursor } from './semanticCursorPrediction'

export interface NeuralInteractionSnapshot {
  predictedNextInput: string
  cursorPredictionActive: boolean
  adaptiveShortcutsLearned: number
  gesturePatterns: number
  interactionLatencyMs: number
  neuralOptimizationScore: number
  contextualInputMode: string
  sessionInteractions: number
  patternAccuracy: number
  predictedInput: ReturnType<typeof predictNextInput>
  gestureContext: ReturnType<typeof computeGestureContext>
  interactionPatterns: ReturnType<typeof learnInteractionPatterns>
  shortcuts: ReturnType<typeof buildCognitiveShortcuts>
  cursorPrediction: ReturnType<typeof predictSemanticCursor>
  updatedAt: number
}

export function runNeuralInteractionRuntime(input: {
  currentAppId: string
  dominantPattern: string
  intentConfidence: number
  uiPressure: 'low' | 'moderate' | 'high'
  topHabits: Array<{ appId: string; frequency: number }>
  sessionInteractions?: number
}): NeuralInteractionSnapshot {
  const { currentAppId, dominantPattern, intentConfidence, uiPressure, topHabits, sessionInteractions = 0 } = input

  const predictedInput = predictNextInput({ currentAppId, intentConfidence, sessionInteractions, dominantPattern })
  const gestureContext = computeGestureContext({ sessionInteractions, activeApp: currentAppId, uiPressure })
  const interactionPatterns = learnInteractionPatterns({ sessionInteractions, dominantPattern, intentConfidence })
  const shortcuts = buildCognitiveShortcuts({ dominantPattern, topHabits, intentConfidence })
  const cursorPrediction = predictSemanticCursor({ activeApp: currentAppId, intentConfidence, uiPressure })

  const patternAccuracy = interactionPatterns.reduce((s, p) => s + p.adaptationScore, 0) / Math.max(1, interactionPatterns.length)
  const neuralOptimizationScore = Math.min(1,
    predictedInput.confidence * 0.35 +
    patternAccuracy * 0.35 +
    gestureContext.gestureAccuracy * 0.3,
  )

  return {
    predictedNextInput: predictedInput.predictedAction,
    cursorPredictionActive: cursorPrediction.predictionActive,
    adaptiveShortcutsLearned: shortcuts.length,
    gesturePatterns: gestureContext.gestureCount,
    interactionLatencyMs: predictedInput.leadTimeMs,
    neuralOptimizationScore,
    contextualInputMode: predictedInput.inputType,
    sessionInteractions,
    patternAccuracy,
    predictedInput,
    gestureContext,
    interactionPatterns,
    shortcuts,
    cursorPrediction,
    updatedAt: Date.now(),
  }
}
