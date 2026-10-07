use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AiInferRequest {
  pub prompt: String,
  pub model: String,
  pub mode: String,
  pub max_tokens: usize,
}

#[derive(Serialize)]
pub struct AiInferResult {
  pub mode: String,
  pub model: String,
  pub output: String,
  pub tokens: usize,
  pub gpu_aware: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AiStreamRequest {
  pub prompt: String,
  pub model_id: String,
}

#[derive(Serialize)]
pub struct AiStreamResult {
  pub chunks: Vec<String>,
}

#[derive(Serialize)]
pub struct AiModelState {
  pub id: String,
  pub loaded: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AiModelAction {
  pub model_id: String,
}

#[derive(Serialize)]
pub struct AiRuntimeHealth {
  pub status: &'static str,
  pub queue_depth: usize,
  pub local_backend: &'static str,
}

#[tauri::command]
pub async fn ai_runtime_infer(request: AiInferRequest) -> AiInferResult {
  let tokens = usize::min(request.max_tokens, 256);

  AiInferResult {
    mode: request.mode,
    model: request.model,
    output: format!(
      "TAURIQ native AI runtime processed prompt: {}",
      request.prompt.chars().take(80).collect::<String>()
    ),
    tokens,
    gpu_aware: true,
  }
}

#[tauri::command]
pub async fn ai_stream_infer(request: AiStreamRequest) -> AiStreamResult {
  AiStreamResult {
    chunks: vec![
      format!("{}:", request.model_id),
      " TAURIQ".to_string(),
      " stream".to_string(),
      format!(" {}", request.prompt.chars().take(20).collect::<String>()),
    ],
  }
}

#[tauri::command]
pub async fn ai_model_list() -> Vec<AiModelState> {
  vec![
    AiModelState {
      id: "llama3".to_string(),
      loaded: true,
    },
    AiModelState {
      id: "qwen".to_string(),
      loaded: false,
    },
    AiModelState {
      id: "phi3".to_string(),
      loaded: false,
    },
  ]
}

#[tauri::command]
pub async fn ai_model_load(action: AiModelAction) -> AiModelState {
  AiModelState {
    id: action.model_id,
    loaded: true,
  }
}

#[tauri::command]
pub async fn ai_model_unload(action: AiModelAction) -> AiModelState {
  AiModelState {
    id: action.model_id,
    loaded: false,
  }
}

#[tauri::command]
pub async fn ai_runtime_health() -> AiRuntimeHealth {
  AiRuntimeHealth {
    status: "healthy",
    queue_depth: 2,
    local_backend: "ollama-local",
  }
}
