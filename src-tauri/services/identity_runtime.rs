use serde::Serialize;

#[derive(Serialize)]
pub struct IdentityRecoveryResult {
  pub status: &'static str,
  pub restored_contexts: usize,
}

#[tauri::command]
pub async fn identity_recover_session() -> IdentityRecoveryResult {
  IdentityRecoveryResult {
    status: "restored",
    restored_contexts: 3,
  }
}
