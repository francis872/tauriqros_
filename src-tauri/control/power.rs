pub const CONTROL_SURFACE: &str = "tauriq-control-surface";

pub fn supported_actions() -> [&'static str; 6] {
  [
    "shutdown",
    "restart",
    "sleep",
    "lock",
    "brightness",
    "audio",
  ]
}
