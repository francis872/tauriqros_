export interface WaylandPreparationState {
  shellProtocols: string[]
  windowLifecycleBoundary: string[]
  compositorHookStatus: 'planned' | 'in-progress'
}

export const WAYLAND_PREPARATION_STATE: WaylandPreparationState = {
  shellProtocols: [
    'xdg-shell',
    'layer-shell',
    'session-lock-v1',
    'wlr-foreign-toplevel-management',
  ],
  windowLifecycleBoundary: [
    'map-window',
    'unmap-window',
    'focus-window',
    'fullscreen-window',
    'recover-window',
  ],
  compositorHookStatus: 'planned',
}
