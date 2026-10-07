export function resolveAdaptiveInferenceScaling(input: {
  queueDepth: number
  thermalC: number
}) {
  if (input.thermalC > 82) {
    return {
      level: 'throttled',
      maxConcurrent: 1,
    }
  }

  return {
    level: input.queueDepth > 4 ? 'boosted' : 'normal',
    maxConcurrent: input.queueDepth > 4 ? 3 : 2,
  }
}
