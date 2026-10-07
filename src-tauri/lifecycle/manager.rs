pub const LIFECYCLE_RUNTIME_STATE: &str = "prototype-ready";

pub fn lifecycle_stages() -> [&'static str; 5] {
  [
    "session-bootstrap",
    "context-load",
    "workspace-restore",
    "automation-prime",
    "desktop-ready",
  ]
}
