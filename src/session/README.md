# TAURIQ Session Architecture (Phase 2)

Target: selectable Linux desktop session (GNOME / KDE / TAURIQ) from display manager login.

Planned integration items:

- Session entry file: /usr/share/wayland-sessions/tauriq.desktop
- Session launcher: /usr/bin/tauriq-session
- Display manager support: GDM, SDDM, Ly
- User runtime manager: systemd --user service tree
