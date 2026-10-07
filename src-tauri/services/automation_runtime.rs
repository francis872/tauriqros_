use serde::Serialize;

#[derive(Serialize)]
pub struct AutomationRuntimeResult {
  pub workflow_id: String,
  pub status: String,
  pub steps_executed: usize,
}

#[tauri::command]
pub async fn automation_run_workflow(workflow_id: String) -> AutomationRuntimeResult {
  let steps_executed = match workflow_id.as_str() {
    "prepare-development-workspace" => 5,
    "resume-ai-project" => 4,
    "open-research-environment" => 4,
    "continue-architecture-session" => 5,
    _ => 1,
  };

  AutomationRuntimeResult {
    workflow_id,
    status: "completed".to_string(),
    steps_executed,
  }
}
