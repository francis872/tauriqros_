export interface VisualCompressionState {
  compressedElements: number
  compressionLevel: 'none' | 'light' | 'moderate' | 'aggressive'
  deferredRenders: string[]
  prioritizedElements: string[]
  compressionGain: number   // 0–1
}

export function compressContextualVisuals(input: {
  renderPressure: number
  activeWindowCount: number
  lowPowerMode: boolean
}): VisualCompressionState {
  const { renderPressure, activeWindowCount, lowPowerMode } = input
  const level: VisualCompressionState['compressionLevel'] =
    (lowPowerMode && renderPressure > 0.5) || renderPressure > 0.85 ? 'aggressive' :
    renderPressure > 0.6 ? 'moderate' :
    renderPressure > 0.35 ? 'light' : 'none'

  const allElements = ['status-bars', 'hover-previews', 'ambient-glow', 'secondary-panels', 'background-particles']
  const deferred = allElements.slice(0, level === 'aggressive' ? 5 : level === 'moderate' ? 3 : level === 'light' ? 1 : 0)
  const prioritized = ['primary-window', 'ai-response', 'active-workflow'].slice(0, activeWindowCount)
  const compressed = Math.round(deferred.length * activeWindowCount * 1.5)

  return {
    compressedElements: compressed,
    compressionLevel: level,
    deferredRenders: deferred,
    prioritizedElements: prioritized,
    compressionGain: deferred.length / Math.max(1, allElements.length),
  }
}
