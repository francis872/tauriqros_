pub const ORCHESTRATION_RUNTIME_STATE: &str = "adaptive";

pub fn runtime_graph_nodes() -> [&'static str; 8] {
  [
    "session-core",
    "daemon-supervisor",
    "ai-runtime",
    "memory-graph",
    "device-runtime",
    "identity-runtime",
    "sync-runtime",
    "observability-runtime",
  ]
}
