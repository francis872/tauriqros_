export interface DesktopLifecycleStage {
  id: string
  label: string
  state: 'pending' | 'running' | 'completed'
}

export function getDesktopLifecycleBlueprint(): DesktopLifecycleStage[] {
  return [
    { id: 'session-identity', label: 'Load identity and profile', state: 'completed' },
    { id: 'workspace-restoration', label: 'Restore workspace memory', state: 'completed' },
    { id: 'presence-bootstrap', label: 'Initialize AI presence', state: 'running' },
    { id: 'desktop-ready', label: 'Enter immersive desktop shell', state: 'pending' },
  ]
}
