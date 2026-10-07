pub const SANDBOX_RUNTIME_STATE: &str = "isolated";

pub fn sandbox_targets() -> [&'static str; 4] {
  [
    "apps",
    "plugins",
    "workflows",
    "agents",
  ]
}
