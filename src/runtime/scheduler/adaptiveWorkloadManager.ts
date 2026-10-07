import { applyThermalScaling } from './thermalScalingRuntime'

export function buildAdaptiveWorkloadPlan(input: {
  thermalC: number
  battery: number
  aiQueueDepth: number
}) {
  const thermal = applyThermalScaling(input.thermalC)

  return {
    aiConcurrency: thermal.aiConcurrency,
    backgroundBudget: thermal.backgroundBudget,
    agentBudget: input.battery < 30 ? 'minimal' : 'normal',
    queuePressure: input.aiQueueDepth > 5 ? 'high' : 'normal',
  }
}
