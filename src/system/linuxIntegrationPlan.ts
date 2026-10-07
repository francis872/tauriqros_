export interface IntegrationCapability {
  id: string
  subsystem: 'wayland' | 'dbus' | 'systemd' | 'pipewire' | 'session'
  status: 'planned' | 'prototype-ready'
  summary: string
}

export const LINUX_INTEGRATION_CAPABILITIES: IntegrationCapability[] = [
  {
    id: 'wayland-shell-surface',
    subsystem: 'wayland',
    status: 'prototype-ready',
    summary: 'Dedicated fullscreen TAURIQ shell surface managed by native runtime',
  },
  {
    id: 'dbus-session-bridge',
    subsystem: 'dbus',
    status: 'planned',
    summary: 'User session bus bridge for notifications, power, and app intents',
  },
  {
    id: 'systemd-user-services',
    subsystem: 'systemd',
    status: 'prototype-ready',
    summary: 'TAURIQ user services with restart policies and health probes',
  },
  {
    id: 'pipewire-media-routing',
    subsystem: 'pipewire',
    status: 'planned',
    summary: 'Media stream control for AI voice and desktop capture workflows',
  },
  {
    id: 'linux-session-entry',
    subsystem: 'session',
    status: 'prototype-ready',
    summary: 'Display-manager selectable TAURIQ desktop session target',
  },
]
