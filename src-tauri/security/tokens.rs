pub const SECURITY_RUNTIME_STATE: &str = "hardened-foundation";

pub fn security_capabilities() -> [&'static str; 4] {
  [
    "session-token-issuance",
    "secure-runtime-messaging",
    "capability-isolation",
    "encrypted-profile-storage",
  ]
}
