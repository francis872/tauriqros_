pub const AI_SCHEDULER_STATE: &str = "adaptive";

pub fn scheduler_features() -> [&'static str; 3] {
  [
    "priority-queues",
    "memory-aware-routing",
    "thermal-aware-scaling",
  ]
}
