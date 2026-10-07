#!/usr/bin/env bash
set -euo pipefail

RUNTIME_DIR="${XDG_RUNTIME_DIR:-/tmp}"
mkdir -p "$RUNTIME_DIR/tauriq"

systemctl --user daemon-reload || true
systemctl --user start tauriq-session.service || true
systemctl --user start tauriq-ai-daemon.service || true
systemctl --user start tauriq-indexing-daemon.service || true
