pub const ORCHESTRATION_TRACK: &str = "desktop-orchestration";

pub fn runtime_capabilities() -> [&'static str; 7] {
  [
    "session-orchestration",
    "startup-bootstrap",
    "daemon-supervision",
    "crash-recovery",
    "context-continuity",
    "launcher-routing",
    "wayland-boundary-prep",
  ]
}
