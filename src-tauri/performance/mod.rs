pub mod gpu;

pub fn acceleration_features() -> Vec<&'static str> {
  vec![
    "gpu-aware-scheduling",
    "ai-runtime-acceleration",
    "streaming-optimization",
  ]
}
