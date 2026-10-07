import { computeSemanticAnimations } from './semanticAnimationRuntime'
import { computeAdaptiveVisualComplexity } from './adaptiveVisualComplexity'
import { compressContextualVisuals } from './contextualVisualCompression'
import { optimizeRuntimeVisuals } from './runtimeVisualOptimizer'
import { scheduleFrames } from './predictiveFrameScheduler'

export interface CognitiveRenderSnapshot {
  renderPressure: number
  visualComplexity: ReturnType<typeof computeAdaptiveVisualComplexity>['complexity']
  frameScheduleMode: ReturnType<typeof scheduleFrames>['mode']
  semanticAnimationActive: boolean
  compressedElements: number
  adaptiveQuality: number
  predictedFrameMs: number
  renderOptimized: boolean
  animations: ReturnType<typeof computeSemanticAnimations>
  complexity: ReturnType<typeof computeAdaptiveVisualComplexity>
  compression: ReturnType<typeof compressContextualVisuals>
  optimizer: ReturnType<typeof optimizeRuntimeVisuals>
  frameSchedule: ReturnType<typeof scheduleFrames>
  updatedAt: number
}

export function runCognitiveRenderEngine(input: {
  renderPressure: number
  gpuUtil: number
  thermalC: number
  activeWindows: number
  autonomyLevel: number
  energyMode: 'performance' | 'balanced' | 'efficient' | 'ultra-saver'
  intentFocusIntensity: number
}): CognitiveRenderSnapshot {
  const { renderPressure, gpuUtil, thermalC, activeWindows, autonomyLevel, energyMode, intentFocusIntensity } = input

  const animations = computeSemanticAnimations({ renderPressure, energyMode, userFocusIntensity: intentFocusIntensity })
  const complexity = computeAdaptiveVisualComplexity({ renderPressure, gpuUtil, thermalC, autonomyLevel })
  const compression = compressContextualVisuals({ renderPressure, activeWindowCount: activeWindows, lowPowerMode: energyMode === 'ultra-saver' })
  const optimizer = optimizeRuntimeVisuals({ gpuUtil, activeWindows, compressionLevel: compression.compressionLevel })
  const frameSchedule = scheduleFrames({ renderPressure, animationBehavior: animations.behavior, energyMode })

  return {
    renderPressure,
    visualComplexity: complexity.complexity,
    frameScheduleMode: frameSchedule.mode,
    semanticAnimationActive: animations.semanticTransitionsEnabled,
    compressedElements: compression.compressedElements,
    adaptiveQuality: optimizer.adaptiveQuality,
    predictedFrameMs: frameSchedule.predictedFrameMs,
    renderOptimized: optimizer.renderOptimized,
    animations,
    complexity,
    compression,
    optimizer,
    frameSchedule,
    updatedAt: Date.now(),
  }
}
