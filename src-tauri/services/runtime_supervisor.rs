use serde::Serialize;

#[derive(Serialize)]
pub struct RuntimeSupervisorState {
  pub status: &'static str,
  pub source: &'static str,
  pub services: usize,
  pub degraded: usize,
}

#[tauri::command]
pub async fn runtime_supervisor_state() -> RuntimeSupervisorState {
  RuntimeSupervisorState {
    status: "healthy",
    source: "native",
    services: 8,
    degraded: 0,
  }
}
