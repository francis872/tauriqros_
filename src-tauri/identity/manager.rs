pub const IDENTITY_RUNTIME_STATE: &str = "operational";

pub fn identity_channels() -> [&'static str; 3] {
  [
    "user-identity",
    "session-identity",
    "device-identity",
  ]
}
