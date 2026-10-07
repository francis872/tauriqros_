pub const AI_RUNTIME_STATE: &str = "hybrid-local";

pub fn model_backends() -> [&'static str; 3] {
  [
    "ollama-local",
    "tauriq-hybrid-router",
    "cloud-fallback",
  ]
}
