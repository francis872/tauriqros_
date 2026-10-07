export type FrameScheduleMode = 'idle' | 'normal' | 'performance' | 'vsync-adaptive'

export interface FrameSchedule {
  mode: FrameScheduleMode
  targetFps: number
  predictedFrameMs: number
  scheduledBudgetMs: number
  jitterMs: number
  vsyncEnabled: boolean
}

export function scheduleFrames(input: {
  renderPressure: number
  animationBehavior: 'none' | 'minimal' | 'contextual' | 'expressive' | 'full'
  energyMode: 'performance' | 'balanced' | 'efficient' | 'ultra-saver'
}): FrameSchedule {
  const { renderPressure, animationBehavior, energyMode } = input

  let mode: FrameScheduleMode = 'normal'
  let targetFps = 60
  if (energyMode === 'ultra-saver' || renderPressure > 0.85) { mode = 'idle'; targetFps = 20 }
  else if (renderPressure > 0.6) { mode = 'vsync-adaptive'; targetFps = 30 }
  else if (animationBehavior === 'full' && energyMode === 'performance') { mode = 'performance'; targetFps = 120 }

  const frameMs = Math.round(1000 / targetFps)
  return {
    mode,
    targetFps,
    predictedFrameMs: frameMs,
    scheduledBudgetMs: frameMs - 2,
    jitterMs: Math.round(renderPressure * 5),
    vsyncEnabled: mode !== 'idle',
  }
}
