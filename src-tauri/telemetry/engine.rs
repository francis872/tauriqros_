pub const TELEMETRY_ENGINE_STATE: &str = "streaming";

pub fn telemetry_streams() -> [&'static str; 6] {
  [
    "runtime-health",
    "daemon-events",
    "ai-runtime",
    "memory-trace",
    "orchestration-log",
    "device-events",
  ]
}
