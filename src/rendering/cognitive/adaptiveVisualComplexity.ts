export type VisualComplexity = 'minimal' | 'standard' | 'rich' | 'full'

export interface VisualComplexityState {
  complexity: VisualComplexity
  qualityScore: number     // 0–1
  activeEffects: string[]
  disabledEffects: string[]
  adaptationReason: string
}

export function computeAdaptiveVisualComplexity(input: {
  renderPressure: number
  gpuUtil: number
  thermalC: number
  autonomyLevel: number
}): VisualComplexityState {
  const { renderPressure, gpuUtil, thermalC, autonomyLevel } = input
  const pressureTotal = renderPressure * 0.4 + gpuUtil * 0.4 + (thermalC - 40) / 100 * 0.2

  const complexity: VisualComplexity =
    pressureTotal > 0.75 ? 'minimal' :
    pressureTotal > 0.5 ? 'standard' :
    autonomyLevel > 0.7 ? 'full' : 'rich'

  const allEffects = ['backdrop-blur', 'shadows', 'gradients', 'glassmorphism', 'particle-fx', 'glow-rings']
  const disabled = allEffects.slice(0, Math.round(pressureTotal * allEffects.length))
  const active = allEffects.filter((e) => !disabled.includes(e))

  return {
    complexity,
    qualityScore: 1 - pressureTotal,
    activeEffects: active,
    disabledEffects: disabled,
    adaptationReason: `Pressure=${pressureTotal.toFixed(2)}, GPU=${(gpuUtil * 100).toFixed(0)}%, T=${thermalC}°C`,
  }
}
