import type { SessionContinuitySnapshot } from '../persistence/sessionStateRepository'

export function runWorkflowRecoveryAgent(snapshot: SessionContinuitySnapshot) {
  const paused = snapshot.workflows.filter((workflow) => workflow.status === 'paused')

  return {
    recovered: paused.length,
    message: paused.length > 0
      ? `${paused.length} paused workflows scheduled for recovery.`
      : 'No paused workflows detected.',
  }
}
