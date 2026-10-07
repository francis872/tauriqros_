import type { SessionContinuitySnapshot } from '../persistence/sessionStateRepository'

export function runContinuityAgent(snapshot: SessionContinuitySnapshot) {
  return {
    unfinishedTasks: snapshot.unfinishedTasks.length,
    nextTask: snapshot.unfinishedTasks[0] ?? 'No unfinished tasks.',
  }
}
