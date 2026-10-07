export function buildDistributedWorkspaceGraph(workspaces: string[], peers: string[]) {
  return workspaces.map((workspace) => ({
    workspace,
    replicatedTo: peers,
    status: peers.length > 0 ? 'synchronized' : 'local',
  }))
}
