export interface DesktopEntrySpec {
  name: string
  comment: string
  exec: string
  type: 'Application'
  desktopNames: string[]
  xSessionManaged: boolean
}

export interface DisplayManagerIntegrationSpec {
  manager: 'gdm' | 'sddm' | 'lightdm'
  sessionDirectory: string
  userServiceTarget: string
}

export interface SessionBlueprint {
  id: 'tauriq'
  desktopEntry: DesktopEntrySpec
  displayManagers: DisplayManagerIntegrationSpec[]
  startupPipeline: string[]
}

export const TAURIQ_SESSION_BLUEPRINT: SessionBlueprint = {
  id: 'tauriq',
  desktopEntry: {
    name: 'TAURIQ',
    comment: 'AI-native desktop shell session',
    exec: '/usr/bin/tauriq-session',
    type: 'Application',
    desktopNames: ['TAURIQ'],
    xSessionManaged: true,
  },
  displayManagers: [
    {
      manager: 'gdm',
      sessionDirectory: '/usr/share/wayland-sessions',
      userServiceTarget: 'graphical-session.target',
    },
    {
      manager: 'sddm',
      sessionDirectory: '/usr/share/wayland-sessions',
      userServiceTarget: 'graphical-session.target',
    },
    {
      manager: 'lightdm',
      sessionDirectory: '/usr/share/wayland-sessions',
      userServiceTarget: 'default.target',
    },
  ],
  startupPipeline: [
    'tauriq-session-preflight.service',
    'tauriq-runtime.service',
    'tauriq-shell.target',
  ],
}
