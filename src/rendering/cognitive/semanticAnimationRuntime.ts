export type AnimationBehavior = 'none' | 'minimal' | 'contextual' | 'expressive' | 'full'

export interface SemanticAnimationState {
  behavior: AnimationBehavior
  durationMultiplier: number   // 0–2 (1 = normal speed)
  springTension: number        // 100–500
  reducedMotion: boolean
  semanticTransitionsEnabled: boolean
}

export function computeSemanticAnimations(input: {
  renderPressure: number
  energyMode: 'performance' | 'balanced' | 'efficient' | 'ultra-saver'
  userFocusIntensity: number   // 0–1
}): SemanticAnimationState {
  const { renderPressure, energyMode, userFocusIntensity } = input
  const reducedMotion = energyMode === 'ultra-saver' || renderPressure > 0.8

  let behavior: AnimationBehavior = 'contextual'
  if (reducedMotion) behavior = 'minimal'
  else if (renderPressure > 0.6) behavior = 'contextual'
  else if (userFocusIntensity > 0.7) behavior = 'full'
  else behavior = 'expressive'

  return {
    behavior,
    durationMultiplier: renderPressure > 0.7 ? 0.5 : renderPressure > 0.4 ? 0.75 : 1.0,
    springTension: renderPressure > 0.6 ? 400 : 200,
    reducedMotion,
    semanticTransitionsEnabled: !reducedMotion,
  }
}
