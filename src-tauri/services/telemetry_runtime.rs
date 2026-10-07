use serde::Serialize;

#[derive(Serialize)]
pub struct TelemetryTraceSummary {
  pub stream_count: usize,
  pub active_traces: usize,
  pub status: &'static str,
}

#[tauri::command]
pub async fn telemetry_trace_summary() -> TelemetryTraceSummary {
  TelemetryTraceSummary {
    stream_count: 6,
    active_traces: 14,
    status: "streaming",
  }
}
