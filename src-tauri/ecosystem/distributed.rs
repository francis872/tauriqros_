pub const DISTRIBUTED_RUNTIME_STATE: &str = "mesh-ready";

pub fn distributed_features() -> [&'static str; 4] {
  [
    "peer-discovery",
    "encrypted-sync",
    "session-handoff",
    "state-replication",
  ]
}
