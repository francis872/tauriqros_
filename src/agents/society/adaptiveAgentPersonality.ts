export type AgentPersonality =
  | 'analytical'
  | 'creative'
  | 'methodical'
  | 'adaptive'
  | 'collaborative'
  | 'autonomous'

export interface PersonalityProfile {
  agentId: string
  personality: AgentPersonality
  adaptationRate: number   // 0–1
  stressResponse: 'calm' | 'focused' | 'aggressive'
  specialization: string
}

function workloadToPersonality(workload: number, anomalyCount: number): AgentPersonality {
  if (anomalyCount > 3) return 'adaptive'
  if (workload > 0.8) return 'methodical'
  if (workload < 0.3) return 'creative'
  return 'collaborative'
}

export function buildAgentPersonalities(input: {
  agentIds: string[]
  workloadPressure: number
  anomalyCount: number
}): PersonalityProfile[] {
  const { agentIds, workloadPressure, anomalyCount } = input
  const base = workloadToPersonality(workloadPressure, anomalyCount)
  return agentIds.map((id, i) => {
    const variations: AgentPersonality[] = ['analytical', 'creative', 'methodical', 'adaptive', 'collaborative', 'autonomous']
    return {
      agentId: id,
      personality: i === 0 ? 'autonomous' : variations[i % variations.length],
      adaptationRate: Math.min(1, 0.5 + (1 - workloadPressure) * 0.4),
      stressResponse: anomalyCount > 3 ? 'focused' : workloadPressure > 0.7 ? 'aggressive' : 'calm',
      specialization: base,
    }
  })
}
