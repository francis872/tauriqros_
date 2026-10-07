export interface MeshPeer {
  id: string
  status: 'online' | 'offline'
  role: 'primary' | 'secondary'
}

export function discoverMeshPeers(): MeshPeer[] {
  return [
    { id: 'tauriq-primary-device', status: 'online', role: 'primary' },
    { id: 'tauriq-laptop-edge', status: 'online', role: 'secondary' },
  ]
}
