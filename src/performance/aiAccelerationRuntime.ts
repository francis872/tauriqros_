export function buildAiAccelerationPlan(input: { queueDepth: number; model: string }) {
  return {
    model: input.model,
    batching: input.queueDepth > 2 ? 'enabled' : 'minimal',
    tokenPrefetch: input.queueDepth > 0,
  }
}
