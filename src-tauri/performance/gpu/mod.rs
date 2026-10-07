pub fn gpu_runtime_features() -> Vec<&'static str> {
  vec![
    "gpu-telemetry",
    "adaptive-inference-scaling",
    "memory-pressure-runtime",
  ]
}
