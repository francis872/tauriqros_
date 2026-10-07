use serde::Serialize;

#[derive(Serialize)]
pub struct RuntimeHealth {
  pub shell: &'static str,
  pub session: &'static str,
  pub ai: &'static str,
}

#[tauri::command]
pub fn desktop_runtime_health() -> RuntimeHealth {
  RuntimeHealth {
    shell: "ready",
    session: "prototype-ready",
    ai: "orchestrator-foundation",
  }
}
