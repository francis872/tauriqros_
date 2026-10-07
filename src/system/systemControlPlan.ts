export interface SystemControlCapability {
  id: string
  operation: 'shutdown' | 'restart' | 'sleep' | 'lock' | 'updates' | 'audio' | 'brightness' | 'battery'
  backend: 'dbus' | 'systemd' | 'upower' | 'pipewire'
  status: 'planned' | 'prototype-ready'
  summary: string
}

export const SYSTEM_CONTROL_CAPABILITIES: SystemControlCapability[] = [
  {
    id: 'control-shutdown',
    operation: 'shutdown',
    backend: 'systemd',
    status: 'planned',
    summary: 'System poweroff through systemd-logind integration.',
  },
  {
    id: 'control-restart',
    operation: 'restart',
    backend: 'systemd',
    status: 'planned',
    summary: 'System reboot orchestration with session save checks.',
  },
  {
    id: 'control-sleep',
    operation: 'sleep',
    backend: 'dbus',
    status: 'prototype-ready',
    summary: 'Suspend/resume with lockscreen-aware state transitions.',
  },
  {
    id: 'control-lock',
    operation: 'lock',
    backend: 'dbus',
    status: 'prototype-ready',
    summary: 'Lockscreen trigger routed through TAURIQ runtime manager.',
  },
  {
    id: 'control-updates',
    operation: 'updates',
    backend: 'systemd',
    status: 'planned',
    summary: 'Background update notifications and restart suggestions.',
  },
  {
    id: 'control-audio',
    operation: 'audio',
    backend: 'pipewire',
    status: 'planned',
    summary: 'Volume routing and output profile control service.',
  },
  {
    id: 'control-brightness',
    operation: 'brightness',
    backend: 'dbus',
    status: 'planned',
    summary: 'Brightness orchestration for desktop and lockscreen.',
  },
  {
    id: 'control-battery',
    operation: 'battery',
    backend: 'upower',
    status: 'prototype-ready',
    summary: 'Battery telemetry and intelligent power recommendations.',
  },
]
