use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmbeddingRequest {
  pub text: String,
  pub model_id: String,
}

#[derive(Serialize)]
pub struct EmbeddingResponse {
  pub vector: Vec<f32>,
  pub model_id: String,
}

#[tauri::command]
pub async fn ai_runtime_embeddings(request: EmbeddingRequest) -> EmbeddingResponse {
  let seed = request.text.len() as f32;

  EmbeddingResponse {
    vector: (0..16).map(|index| ((seed % (index as f32 + 5.0)) / 10.0)).collect(),
    model_id: request.model_id,
  }
}
