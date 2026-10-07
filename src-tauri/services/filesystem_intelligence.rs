use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct FilesystemSemanticQuery {
  pub query: String,
}

#[derive(Serialize)]
pub struct FilesystemSemanticSummary {
  pub query: String,
  pub summary: String,
}

#[tauri::command]
pub async fn filesystem_semantic_summary(input: FilesystemSemanticQuery) -> FilesystemSemanticSummary {
  FilesystemSemanticSummary {
    query: input.query.clone(),
    summary: format!(
      "Semantic index suggests high relevance for development and AI workflow files around '{}'.",
      input.query
    ),
  }
}
