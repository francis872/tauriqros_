pub mod rag;

pub fn cognitive_search_capabilities() -> Vec<&'static str> {
  vec![
    "intent-aware-search",
    "semantic-ranking",
    "temporal-recall",
  ]
}
