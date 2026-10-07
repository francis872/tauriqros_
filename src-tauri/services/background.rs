pub const BACKGROUND_SERVICE_STATE: &str = "planned";

pub fn registered_background_services() -> [&'static str; 7] {
  [
    "tauriq-ai-daemon",
    "tauriq-workspace-daemon",
    "tauriq-context-daemon",
    "tauriq-indexing-daemon",
    "tauriq-notification-daemon",
    "tauriq-automation-daemon",
    "tauriq-lifecycle-daemon",
  ]
}
