#!/usr/bin/env bash
set -euo pipefail

systemctl --user daemon-reload
systemctl --user is-enabled tauriq-session.service || true
systemctl --user is-enabled tauriq-ai-daemon.service || true
systemctl --user is-enabled tauriq-indexing-daemon.service || true

echo "Session desktop entry:"
ls -l /usr/share/wayland-sessions/tauriq.desktop || true

echo "TAURIQ runtime validation completed."
