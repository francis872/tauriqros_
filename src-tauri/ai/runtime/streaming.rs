pub const STREAMING_RUNTIME_STATE: &str = "active";

pub fn streaming_capabilities() -> [&'static str; 3] {
  [
    "token-streaming",
    "chunked-response-bridge",
    "runtime-backpressure-awareness",
  ]
}
