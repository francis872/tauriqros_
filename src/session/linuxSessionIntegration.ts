export interface LinuxSessionArtifact {
  fileName: string
  targetPath: string
  contentPreview: string
}

export const TAURIQ_WAYLAND_SESSION_ARTIFACTS: LinuxSessionArtifact[] = [
  {
    fileName: 'tauriq.desktop',
    targetPath: '/usr/share/wayland-sessions/tauriq.desktop',
    contentPreview: `[Desktop Entry]\nName=TAURIQ\nComment=AI-native operating session\nExec=/usr/local/bin/tauriq-session-start\nType=Application\nDesktopNames=TAURIQ\nX-GDM-SessionRegisters=true`,
  },
  {
    fileName: 'tauriq-session-start',
    targetPath: '/usr/local/bin/tauriq-session-start',
    contentPreview: `#!/usr/bin/env bash\nexport XDG_CURRENT_DESKTOP=TAURIQ\nexport XDG_SESSION_TYPE=wayland\nexec /usr/local/bin/tauriq --fullscreen --session-mode`,
  },
  {
    fileName: 'tauriq-session.service',
    targetPath: '/usr/lib/systemd/user/tauriq-session.service',
    contentPreview: `[Unit]\nDescription=TAURIQ Runtime\nAfter=graphical-session.target\n[Service]\nExecStart=/usr/local/bin/tauriq-session-runtime`,
  },
  {
    fileName: 'tauriq-ai-daemon.service',
    targetPath: '/usr/lib/systemd/user/tauriq-ai-daemon.service',
    contentPreview: `[Unit]\nDescription=TAURIQ AI Daemon\nAfter=tauriq-session.service\n[Service]\nExecStart=/usr/local/bin/tauriq-ai-daemon`,
  },
]
