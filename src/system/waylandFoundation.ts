export interface WaylandFoundationLayer {
  id: string
  scope: 'compositor' | 'protocol' | 'shell' | 'integration'
  status: 'planned' | 'prototype-ready'
  description: string
}

export const WAYLAND_FOUNDATION_LAYERS: WaylandFoundationLayer[] = [
  {
    id: 'surface-lifecycle',
    scope: 'shell',
    status: 'prototype-ready',
    description: 'Lifecycle management for TAURIQ fullscreen shell surfaces.',
  },
  {
    id: 'xdg-shell-routing',
    scope: 'protocol',
    status: 'planned',
    description: 'Protocol abstraction for window state and client intent routing.',
  },
  {
    id: 'compositor-core',
    scope: 'compositor',
    status: 'planned',
    description: 'Future TAURIQ compositor runtime and render loop foundation.',
  },
  {
    id: 'dbus-desktop-bridge',
    scope: 'integration',
    status: 'prototype-ready',
    description: 'Desktop service bridge for notifications, power, and session events.',
  },
]
