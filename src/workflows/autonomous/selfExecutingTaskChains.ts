export interface TaskChain {
  chainId: string
  name: string
  steps: string[]
  currentStep: number
  status: 'running' | 'paused' | 'completed' | 'failed'
  startedAt: number
  completionRatio: number  // 0–1
}

export function buildSelfExecutingChains(input: {
  activeGoals: string[]
  autonomyLevel: number   // 0–1
  executionPressure: number
}): TaskChain[] {
  const { activeGoals, autonomyLevel, executionPressure } = input
  return activeGoals.slice(0, 3).map((goal, i) => {
    const steps = ['initialize', 'analyze', 'plan', 'execute', 'validate', 'complete']
    const stepsCompleted = Math.round(autonomyLevel * (steps.length - 1) - executionPressure * 2)
    const currentStep = Math.max(0, Math.min(steps.length - 1, stepsCompleted))
    return {
      chainId: `chain-${i}`,
      name: goal,
      steps,
      currentStep,
      status: currentStep === steps.length - 1 ? 'completed' : executionPressure > 0.8 ? 'paused' : 'running',
      startedAt: Date.now() - i * 1000 * 60 * 10,
      completionRatio: currentStep / (steps.length - 1),
    }
  })
}
