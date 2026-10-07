pub fn recovery_policies() -> [&'static str; 3] {
  [
    "daemon-restart",
    "workflow-resume",
    "anomaly-mitigation",
  ]
}
