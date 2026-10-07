pub const SESSION_RUNTIME_MANAGER: &str = "tauriq-session-runtime";

pub fn startup_flow() -> [&'static str; 7] {
  [
    "linux-session-handshake",
    "identity-load",
    "service-bootstrap",
    "ai-runtime-init",
    "workspace-restore",
    "context-restore",
    "desktop-enter",
  ]
}
