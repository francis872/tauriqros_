export function optimizeRenderPipeline(input: { activeWindows: number; battery: number }) {
  return {
    frameBudget: input.battery < 30 ? 45 : 60,
    layerCaching: input.activeWindows > 3 ? 'aggressive' : 'standard',
  }
}
