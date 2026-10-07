pub const RUNTIME_SUPERVISOR_STATE: &str = "operational";

pub fn supervisor_capabilities() -> [&'static str; 5] {
  [
    "service-supervision",
    "dependency-graph",
    "health-monitoring",
    "recovery-policies",
    "telemetry-streaming",
  ]
}
