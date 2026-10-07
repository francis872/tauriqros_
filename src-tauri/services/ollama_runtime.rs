use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeStreamRequest {
  pub prompt: String,
  pub model_id: String,
}

#[derive(Serialize)]
pub struct RuntimeStreamResult {
  pub chunks: Vec<String>,
  pub throughput_tps: f32,
}

#[derive(Serialize)]
pub struct RuntimeModelsResult {
  pub models: Vec<&'static str>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeCancelRequest {
  pub request_id: String,
}

#[derive(Serialize)]
pub struct RuntimeCancelResult {
  pub cancelled: bool,
  pub request_id: String,
}

#[derive(Serialize)]
pub struct RuntimeQueueState {
  pub depth: usize,
  pub processing: bool,
}

#[tauri::command]
pub async fn ai_runtime_stream(request: RuntimeStreamRequest) -> RuntimeStreamResult {
  RuntimeStreamResult {
    chunks: vec![
      format!("{}:", request.model_id),
      " native".to_string(),
      " token".to_string(),
      format!(" {}", request.prompt.chars().take(24).collect::<String>()),
    ],
    throughput_tps: 18.5,
  }
}

#[tauri::command]
pub async fn ai_runtime_models() -> RuntimeModelsResult {
  RuntimeModelsResult {
    models: vec!["llama3", "qwen", "phi3"],
  }
}

#[tauri::command]
pub async fn ai_runtime_cancel(request: RuntimeCancelRequest) -> RuntimeCancelResult {
  RuntimeCancelResult {
    cancelled: true,
    request_id: request.request_id,
  }
}

#[tauri::command]
pub async fn ai_runtime_queue_state() -> RuntimeQueueState {
  RuntimeQueueState {
    depth: 2,
    processing: true,
  }
}
