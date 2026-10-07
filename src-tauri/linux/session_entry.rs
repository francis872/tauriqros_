pub const WAYLAND_SESSION_TARGET: &str = "/usr/share/wayland-sessions/tauriq.desktop";

pub fn startup_scripts() -> [&'static str; 3] {
  [
    "/usr/local/bin/tauriq-session-start",
    "/usr/local/share/tauriq/bootstrap/tauriq-bootstrap.sh",
    "/usr/lib/systemd/user/tauriq-session.service",
  ]
}
