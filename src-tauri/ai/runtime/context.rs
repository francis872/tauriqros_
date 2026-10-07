pub const AI_CONTEXT_STATE: &str = "persistent";

pub fn context_channels() -> [&'static str; 3] {
  [
    "session-memory",
    "workflow-context",
    "project-continuity",
  ]
}
