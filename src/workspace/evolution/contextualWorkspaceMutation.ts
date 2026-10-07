export type MutationType = 'zone-expand' | 'zone-collapse' | 'panel-swap' | 'layout-shift' | 'focus-redirect'

export interface WorkspaceMutation {
  mutationId: string
  type: MutationType
  targetZone: string
  reason: string
  appliedAt: number
}

export function buildWorkspaceMutations(input: {
  dominantPattern: string
  intentConfidence: number
  executionPressure: number
  previousMutationCount: number
}): WorkspaceMutation[] {
  const { dominantPattern, intentConfidence, executionPressure, previousMutationCount } = input
  const mutations: WorkspaceMutation[] = []

  if (intentConfidence > 0.75 && dominantPattern) {
    mutations.push({
      mutationId: `mut-${Date.now() % 10000}`,
      type: 'focus-redirect',
      targetZone: dominantPattern,
      reason: `High intent confidence for "${dominantPattern}"`,
      appliedAt: Date.now(),
    })
  }

  if (executionPressure > 0.7) {
    mutations.push({
      mutationId: `mut-${Date.now() % 10000 + 1}`,
      type: 'zone-collapse',
      targetZone: 'secondary-panels',
      reason: 'High execution pressure — reducing visual load',
      appliedAt: Date.now(),
    })
  }

  if (previousMutationCount > 5) {
    mutations.push({
      mutationId: `mut-${Date.now() % 10000 + 2}`,
      type: 'layout-shift',
      targetZone: 'primary',
      reason: 'Stabilizing after mutation cascade',
      appliedAt: Date.now(),
    })
  }

  return mutations
}
