export interface CognitiveShortcut {
  shortcutId: string
  trigger: string
  action: string
  learnedFrom: string
  useCount: number
  confidence: number   // 0–1
}

export function buildCognitiveShortcuts(input: {
  dominantPattern: string
  topHabits: Array<{ appId: string; frequency: number }>
  intentConfidence: number
}): CognitiveShortcut[] {
  const { dominantPattern, topHabits, intentConfidence } = input
  const shortcuts: CognitiveShortcut[] = [
    {
      shortcutId: 'cs-0',
      trigger: `Ctrl+Shift+${dominantPattern.charAt(0).toUpperCase()}`,
      action: `open-${dominantPattern}-workspace`,
      learnedFrom: 'behavioral-intent',
      useCount: Math.round(intentConfidence * 20),
      confidence: intentConfidence,
    },
    {
      shortcutId: 'cs-1',
      trigger: 'Ctrl+Shift+A',
      action: 'activate-autonomous-mode',
      learnedFrom: 'kernel-pattern',
      useCount: 5,
      confidence: 0.8,
    },
  ]
  topHabits.slice(0, 2).forEach((h, i) => {
    shortcuts.push({
      shortcutId: `cs-habit-${i}`,
      trigger: `Ctrl+Shift+${i + 1}`,
      action: `launch-${h.appId}`,
      learnedFrom: 'habit-memory',
      useCount: h.frequency,
      confidence: Math.min(1, h.frequency * 0.1),
    })
  })
  return shortcuts
}
