export type ConsciousnessLevel = 'dormant' | 'passive' | 'aware' | 'active' | 'hyper'

export interface ConsciousnessState {
  level: ConsciousnessLevel
  depth: number       // 0–1
  attentionFocus: string
  cognitiveLoad: number  // 0–1
  awarenessRadius: number  // how many subsystems are tracked
}

const LEVELS: ConsciousnessLevel[] = ['dormant', 'passive', 'aware', 'active', 'hyper']

export function assessRuntimeConsciousness(input: {
  activeSubsystems: number
  intentConfidence: number
  healingActive: boolean
  queueDepth: number
}): ConsciousnessState {
  const { activeSubsystems, intentConfidence, healingActive, queueDepth } = input
  const load = Math.min(1, activeSubsystems * 0.05 + queueDepth * 0.03)
  const depth = Math.min(1, intentConfidence * 0.6 + (healingActive ? 0.2 : 0) + load * 0.2)
  const idx = Math.min(4, Math.floor(depth * 5))
  return {
    level: LEVELS[idx],
    depth,
    attentionFocus: healingActive ? 'self-repair' : intentConfidence > 0.7 ? 'workflow-prediction' : 'observation',
    cognitiveLoad: load,
    awarenessRadius: activeSubsystems,
  }
}
