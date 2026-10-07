import { runSemanticSync } from './semanticSyncEngine'
import { buildDistributedWorkspaceGraph } from './distributedWorkspaceGraph'
import { relayLiveContinuity } from './liveContinuityRelay'

export function bootstrapCollaborativeRuntime(input: {
  deviceId: string
  peers: string[]
  workspaces: string[]
  revision: number
}) {
  return {
    sync: runSemanticSync(input.peers, input.revision),
    graph: buildDistributedWorkspaceGraph(input.workspaces, input.peers),
    relay: relayLiveContinuity(input.deviceId, input.peers),
  }
}
