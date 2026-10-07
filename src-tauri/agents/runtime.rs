pub const AGENT_RUNTIME_STATE: &str = "persistent";

pub fn agent_catalog() -> [&'static str; 4] {
  [
    "workflow-recovery-agent",
    "continuity-agent",
    "proactive-assistant",
    "runtime-watch-agent",
  ]
}
