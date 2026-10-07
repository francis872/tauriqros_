export function evaluateAiMemoryPressure(input: {
  queueDepth: number
  vramUsedMb: number
}) {
  const pressure = Math.min(1, (input.queueDepth * 0.08) + (input.vramUsedMb / 10000))

  return {
    pressure: Number(pressure.toFixed(2)),
    state: pressure > 0.8 ? 'high' : pressure > 0.6 ? 'elevated' : 'stable',
  }
}
