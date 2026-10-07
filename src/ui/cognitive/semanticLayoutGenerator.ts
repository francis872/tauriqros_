export type AdaptiveLayoutHint =
  | 'single-focus'
  | 'dual-panel'
  | 'research-grid'
  | 'command-center'
  | 'monitoring-view'
  | 'workflow-stream'

export interface SemanticLayout {
  hint: AdaptiveLayoutHint
  columns: number
  primarySurface: string
  secondarySurfaces: string[]
  densityScore: number   // 0–1
  rationale: string
}

const LAYOUT_MAP: Record<string, AdaptiveLayoutHint> = {
  'deep-work': 'single-focus',
  'research': 'research-grid',
  'development': 'dual-panel',
  'review': 'dual-panel',
  'monitoring': 'monitoring-view',
  'workflow': 'workflow-stream',
  'default': 'command-center',
}

export function generateSemanticLayout(input: {
  dominantPattern: string
  uiPressure: 'low' | 'moderate' | 'high'
  activeWorkflowCount: number
}): SemanticLayout {
  const { dominantPattern, uiPressure, activeWorkflowCount } = input
  const hint = LAYOUT_MAP[dominantPattern] ?? 'command-center'
  const columns = uiPressure === 'high' ? 1 : hint === 'research-grid' ? 3 : 2
  return {
    hint,
    columns,
    primarySurface: dominantPattern || 'workspace',
    secondarySurfaces: activeWorkflowCount > 1 ? ['workflow-panel', 'monitor-strip'] : ['status-bar'],
    densityScore: uiPressure === 'high' ? 0.3 : uiPressure === 'moderate' ? 0.6 : 0.85,
    rationale: `Pattern "${dominantPattern}" under ${uiPressure} pressure → ${hint}`,
  }
}
