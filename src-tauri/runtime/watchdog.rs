pub const WATCHDOG_RUNTIME_STATE: &str = "active";

pub fn watchdog_signals() -> [&'static str; 3] {
  [
    "heartbeat-loss",
    "thermal-spike",
    "service-degradation",
  ]
}
