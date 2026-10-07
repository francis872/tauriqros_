pub mod client;
pub mod streaming;
pub mod embeddings;
pub mod models;

pub fn ollama_features() -> Vec<&'static str> {
  vec![
    "streaming-inference",
    "embedding-generation",
    "model-registry",
  ]
}
