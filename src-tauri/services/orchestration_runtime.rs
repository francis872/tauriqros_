use serde::Serialize;

#[derive(Serialize)]
pub struct OrchestrationGraph {
  pub nodes: Vec<&'static str>,
  pub edges: usize,
}

#[tauri::command]
pub async fn orchestration_dependency_graph() -> OrchestrationGraph {
  OrchestrationGraph {
    nodes: vec![
      "session-core",
      "daemon-supervisor",
      "ai-runtime",
      "memory-graph",
      "device-runtime",
      "identity-runtime",
      "sync-runtime",
      "observability-runtime",
    ],
    edges: 10,
  }
}
