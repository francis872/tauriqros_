use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RagQueryRequest {
  pub query: String,
  pub context: String,
}

#[derive(Serialize)]
pub struct RagQueryResponse {
  pub retrieved: String,
  pub confidence: f32,
}

#[tauri::command]
pub async fn rag_runtime_query(request: RagQueryRequest) -> RagQueryResponse {
  RagQueryResponse {
    retrieved: format!(
      "RAG stitched context for '{}': {}",
      request.query,
      request.context.chars().take(96).collect::<String>()
    ),
    confidence: 0.84,
  }
}
