#!/usr/bin/env bash
set -euo pipefail

SESSION_DIR="/usr/share/wayland-sessions"
BIN_DIR="/usr/local/bin"
BOOTSTRAP_DIR="/usr/local/share/tauriq/bootstrap"
SYSTEMD_USER_DIR="/usr/lib/systemd/user"

sudo install -Dm644 linux/sessions/tauriq.desktop "$SESSION_DIR/tauriq.desktop"
sudo install -Dm755 linux/startup/tauriq-session-start "$BIN_DIR/tauriq-session-start"
sudo install -Dm755 linux/bootstrap/tauriq-bootstrap.sh "$BOOTSTRAP_DIR/tauriq-bootstrap.sh"
sudo install -Dm644 linux/systemd/user/tauriq-session.service "$SYSTEMD_USER_DIR/tauriq-session.service"
sudo install -Dm644 linux/systemd/user/tauriq-ai-daemon.service "$SYSTEMD_USER_DIR/tauriq-ai-daemon.service"
sudo install -Dm644 linux/systemd/user/tauriq-indexing-daemon.service "$SYSTEMD_USER_DIR/tauriq-indexing-daemon.service"

echo "TAURIQ session artifacts installed."
