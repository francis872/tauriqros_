pub const INFERENCE_RUNTIME_STATE: &str = "operational";

pub fn inference_targets() -> [&'static str; 3] {
  [
    "local-ollama",
    "hybrid-router",
    "cloud-fallback",
  ]
}
