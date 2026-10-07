pub const DAEMON_RUNTIME_STATE: &str = "operational";

pub fn daemon_registry() -> [&'static str; 7] {
  [
    "ai-daemon",
    "workspace-daemon",
    "context-daemon",
    "indexing-daemon",
    "notification-daemon",
    "automation-daemon",
    "lifecycle-daemon",
  ]
}
