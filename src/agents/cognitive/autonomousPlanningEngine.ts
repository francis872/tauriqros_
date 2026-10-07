import { runAutonomousPlanner } from '../../planning/autonomousPlanner'

export function runAgentPlanning(seed: string, queueDepth: number, anomalies: number) {
  return runAutonomousPlanner({
    seed,
    queueDepth,
    anomalies,
  })
}
