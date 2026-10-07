use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionBootstrapInput {
  pub workspace: String,
  pub unfinished_workflows: usize,
}

#[derive(Serialize)]
pub struct SessionBootstrapResult {
  pub status: String,
  pub runtime_mode: String,
  pub workspace: String,
  pub unfinished_workflows: usize,
  pub daemons_started: usize,
}

#[derive(Serialize)]
pub struct DaemonStatus {
  pub id: &'static str,
  pub health: &'static str,
}

#[derive(Serialize)]
pub struct DaemonStatusResult {
  pub daemons: Vec<DaemonStatus>,
}

#[tauri::command]
pub async fn session_runtime_bootstrap(input: SessionBootstrapInput) -> SessionBootstrapResult {
  SessionBootstrapResult {
    status: "ready".to_string(),
    runtime_mode: "wayland-session".to_string(),
    workspace: input.workspace,
    unfinished_workflows: input.unfinished_workflows,
    daemons_started: 7,
  }
}

#[tauri::command]
pub async fn session_runtime_daemon_status() -> DaemonStatusResult {
  DaemonStatusResult {
    daemons: vec![
      DaemonStatus { id: "ai-daemon", health: "ready" },
      DaemonStatus { id: "workspace-daemon", health: "ready" },
      DaemonStatus { id: "context-daemon", health: "ready" },
      DaemonStatus { id: "indexing-daemon", health: "starting" },
      DaemonStatus { id: "notification-daemon", health: "ready" },
      DaemonStatus { id: "automation-daemon", health: "ready" },
      DaemonStatus { id: "lifecycle-daemon", health: "ready" },
    ],
  }
}
