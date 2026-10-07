export interface LoginSessionOption {
  id: string
  displayName: string
  description: string
  execPreview: string
}

export interface SessionRuntimeState {
  activeSession: 'tauriq'
  displayProtocol: 'wayland'
  lifecycle: 'booting' | 'ready'
}

export const DISPLAY_MANAGER_TARGETS = [
  { id: 'gdm', displayName: 'GDM', description: 'GNOME display manager integration' },
  { id: 'sddm', displayName: 'SDDM', description: 'KDE and custom Wayland session support' },
  { id: 'lightdm', displayName: 'LightDM', description: 'Lightweight display manager session support' },
] as const

export const SESSION_OPTIONS: LoginSessionOption[] = [
  {
    id: 'gnome',
    displayName: 'GNOME',
    description: 'Fallback desktop session',
    execPreview: '/usr/bin/gnome-session',
  },
  {
    id: 'kde',
    displayName: 'KDE Plasma',
    description: 'Fallback desktop session',
    execPreview: '/usr/bin/startplasma-wayland',
  },
  {
    id: 'tauriq',
    displayName: 'TAURIQ',
    description: 'AI-native desktop shell session',
    execPreview: '/usr/bin/tauriq-session',
  },
]

export const DEFAULT_SESSION_STATE: SessionRuntimeState = {
  activeSession: 'tauriq',
  displayProtocol: 'wayland',
  lifecycle: 'ready',
}
