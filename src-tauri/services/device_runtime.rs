use serde::Serialize;

#[derive(Serialize)]
pub struct DeviceTelemetrySnapshot {
  pub battery: u8,
  pub cpu: u8,
  pub gpu: u8,
  pub thermal_c: u8,
  pub network: &'static str,
  pub bluetooth: &'static str,
}

#[tauri::command]
pub async fn device_runtime_snapshot() -> DeviceTelemetrySnapshot {
  DeviceTelemetrySnapshot {
    battery: 84,
    cpu: 41,
    gpu: 26,
    thermal_c: 58,
    network: "online",
    bluetooth: "enabled",
  }
}
