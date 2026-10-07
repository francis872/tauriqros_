use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionTokenRequest {
  pub user_id: String,
  pub device_id: String,
}

#[derive(Serialize)]
pub struct SessionTokenResult {
  pub token: String,
  pub issued_at: u64,
}

#[tauri::command]
pub async fn security_issue_session_token(request: SessionTokenRequest) -> SessionTokenResult {
  let issued_at = std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .map(|duration| duration.as_secs())
    .unwrap_or(0);

  SessionTokenResult {
    token: format!("tq-{}-{}", request.user_id, request.device_id),
    issued_at,
  }
}
