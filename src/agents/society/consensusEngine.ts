export type VoteOutcome = 'approved' | 'rejected' | 'deferred' | 'pending'

export interface ConsensusRound {
  topic: string
  votes: Record<string, boolean>
  outcome: VoteOutcome
  quorumReached: boolean
  consensusScore: number   // 0–1
  roundMs: number
}

export function runConsensusRound(input: {
  topic: string
  agentIds: string[]
  approvalBias: number   // 0–1; higher = more likely approval
}): ConsensusRound {
  const { topic, agentIds, approvalBias } = input
  const votes: Record<string, boolean> = {}
  let yeas = 0
  agentIds.forEach((id) => {
    const vote = Math.random() < approvalBias
    votes[id] = vote
    if (vote) yeas++
  })
  const ratio = agentIds.length > 0 ? yeas / agentIds.length : 0
  const quorum = agentIds.length >= 3
  let outcome: VoteOutcome = 'pending'
  if (quorum) {
    outcome = ratio >= 0.6 ? 'approved' : ratio < 0.3 ? 'rejected' : 'deferred'
  }
  return {
    topic,
    votes,
    outcome,
    quorumReached: quorum,
    consensusScore: ratio,
    roundMs: Math.round(10 + (1 - ratio) * 50),
  }
}
