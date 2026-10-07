export interface InteractionPattern {
  patternId: string
  description: string
  frequency: number       // sessions observed
  lastObserved: number
  adaptationScore: number // 0–1
}

export function learnInteractionPatterns(input: {
  sessionInteractions: number
  dominantPattern: string
  intentConfidence: number
}): InteractionPattern[] {
  const { sessionInteractions, dominantPattern, intentConfidence } = input
  const basePatterns = [
    `${dominantPattern}-open`,
    'snap-layout-switch',
    'ai-query-sequence',
    'workspace-focus',
    'monitor-check',
  ]
  return basePatterns.map((desc, i) => ({
    patternId: `interaction-${i}`,
    description: desc,
    frequency: Math.max(1, sessionInteractions - i * 5),
    lastObserved: Date.now() - i * 60000,
    adaptationScore: Math.max(0.1, intentConfidence - i * 0.1),
  }))
}
