pub const DEVICE_RUNTIME_STATE: &str = "operational";

pub fn telemetry_domains() -> [&'static str; 9] {
  [
    "battery",
    "gpu",
    "cpu",
    "thermal",
    "audio",
    "bluetooth",
    "network",
    "storage",
    "monitors",
  ]
}
