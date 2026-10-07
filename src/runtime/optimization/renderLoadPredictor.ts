export interface RenderLoadPrediction {
  renderPressure: number    // 0–1
  predictedFrameMs: number
  suggestedQuality: 'minimal' | 'low' | 'standard' | 'high'
  animationThrottle: boolean
  complexElementCount: number
  frameRateCap: number
}

export function predictRenderLoad(input: {
  activeWindows: number
  gpuUtil: number
  cpuLoad: number
  animationsEnabled: boolean
}): RenderLoadPrediction {
  const { activeWindows, gpuUtil, cpuLoad, animationsEnabled } = input
  const pressure = Math.min(1, gpuUtil * 0.5 + cpuLoad * 0.3 + activeWindows * 0.04)
  const suggestedQuality: RenderLoadPrediction['suggestedQuality'] =
    pressure > 0.8 ? 'minimal' :
    pressure > 0.6 ? 'low' :
    pressure > 0.35 ? 'standard' : 'high'

  return {
    renderPressure: pressure,
    predictedFrameMs: Math.round(1000 / (pressure > 0.7 ? 30 : pressure > 0.4 ? 45 : 60)),
    suggestedQuality,
    animationThrottle: animationsEnabled && pressure > 0.6,
    complexElementCount: Math.round(activeWindows * 8 + (animationsEnabled ? 12 : 2)),
    frameRateCap: pressure > 0.7 ? 30 : pressure > 0.4 ? 45 : 60,
  }
}
