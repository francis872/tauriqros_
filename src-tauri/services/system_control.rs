use serde::Serialize;

#[derive(Serialize)]
pub struct SystemActionResult {
  pub action: String,
  pub status: String,
  pub backend: String,
  pub timestamp: u64,
}

#[tauri::command]
pub async fn system_control_execute(action: String) -> Result<SystemActionResult, String> {
  let allowed = [
    "shutdown",
    "restart",
    "suspend",
    "lock",
    "logout",
    "audio",
    "brightness",
    "wifi",
    "bluetooth",
    "battery",
    "updates",
    "notifications",
  ];

  if !allowed.iter().any(|item| *item == action) {
    return Err(format!("unsupported action: {}", action));
  }

  let backend = if ["shutdown", "restart", "logout", "suspend"].contains(&action.as_str()) {
    "systemd/dbus"
  } else if ["audio", "notifications"].contains(&action.as_str()) {
    "pipewire/portal"
  } else {
    "dbus"
  };

  Ok(SystemActionResult {
    action,
    status: "queued".to_string(),
    backend: backend.to_string(),
    timestamp: std::time::SystemTime::now()
      .duration_since(std::time::UNIX_EPOCH)
      .map(|duration| duration.as_secs())
      .unwrap_or(0),
  })
}
