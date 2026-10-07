# TAURIQ Linux Session Integration

This directory defines how TAURIQ is installed and launched as a native Linux desktop session.

## Session Selection

- Install `linux/sessions/tauriq.desktop` into `/usr/share/wayland-sessions/`
- Install `linux/startup/tauriq-session-start` into `/usr/local/bin/`
- Ensure executable permissions (`chmod +x`) are applied

After installation, TAURIQ appears in:

- GDM session chooser
- SDDM session chooser
- LightDM session chooser

## Runtime Bootstrap

The startup script runs `linux/bootstrap/tauriq-bootstrap.sh`, which starts systemd user services and preloads TAURIQ runtime directories.

## User Services

Use files under `linux/systemd/user/` as user-level services for session runtime, AI daemon, and indexing daemon.
