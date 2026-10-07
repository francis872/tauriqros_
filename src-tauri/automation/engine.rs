pub const AUTOMATION_RUNTIME_STATE: &str = "prototype-ready";

pub fn supported_workflows() -> [&'static str; 4] {
  [
    "prepare-development-workspace",
    "resume-ai-project",
    "open-research-environment",
    "continue-architecture-session",
  ]
}
