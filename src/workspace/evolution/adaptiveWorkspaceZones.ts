export type ZoneType = 'primary' | 'secondary' | 'overlay' | 'ambient' | 'focus'

export interface WorkspaceZone {
  id: string
  type: ZoneType
  label: string
  active: boolean
  priority: number  // 1 = highest
  adaptedBy: string
}

export function computeAdaptiveWorkspaceZones(input: {
  dominantPattern: string
  uiPressure: 'low' | 'moderate' | 'high'
  healingActive: boolean
}): WorkspaceZone[] {
  const { dominantPattern, uiPressure, healingActive } = input

  const base: WorkspaceZone[] = [
    { id: 'z-primary', type: 'primary', label: dominantPattern || 'workspace', active: true, priority: 1, adaptedBy: 'intent-engine' },
    { id: 'z-focus', type: 'focus', label: 'focused-task', active: uiPressure !== 'high', priority: 2, adaptedBy: 'cognitive-kernel' },
    { id: 'z-secondary', type: 'secondary', label: 'supporting-tools', active: uiPressure === 'low', priority: 3, adaptedBy: 'layout-engine' },
    { id: 'z-overlay', type: 'overlay', label: 'monitoring', active: healingActive, priority: 4, adaptedBy: 'healing-supervisor' },
    { id: 'z-ambient', type: 'ambient', label: 'ambient-context', active: uiPressure === 'low', priority: 5, adaptedBy: 'consciousness-runtime' },
  ]

  return base.filter((z) => z.active)
}
