use serde::Serialize;

#[derive(Serialize)]
pub struct FilesystemEntry {
  pub name: String,
  pub path: String,
  pub kind: String,
  pub size: u64,
  pub modified_at: Option<String>,
}

#[derive(Serialize)]
pub struct DirectorySnapshot {
  pub path: String,
  pub entries: Vec<FilesystemEntry>,
  pub source: &'static str,
}

#[tauri::command]
pub async fn filesystem_read_directory(path: String) -> Result<DirectorySnapshot, String> {
  let path_clone = path.clone();

  let entries = tokio::task::spawn_blocking(move || {
    let mut output: Vec<FilesystemEntry> = Vec::new();

    let read_dir = std::fs::read_dir(&path_clone)
      .map_err(|error| format!("failed to read directory: {}", error))?;

    for entry_result in read_dir {
      let entry = entry_result.map_err(|error| format!("failed entry read: {}", error))?;
      let metadata = entry
        .metadata()
        .map_err(|error| format!("failed metadata read: {}", error))?;

      let kind = if metadata.is_dir() {
        "directory"
      } else if metadata.is_file() {
        "file"
      } else {
        "other"
      };

      let modified_at = metadata
        .modified()
        .ok()
        .and_then(|mtime| mtime.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|duration| duration.as_secs().to_string());

      let path_string = entry.path().to_string_lossy().to_string();
      let name = entry.file_name().to_string_lossy().to_string();

      output.push(FilesystemEntry {
        name,
        path: path_string,
        kind: kind.to_string(),
        size: metadata.len(),
        modified_at,
      });
    }

    Ok::<Vec<FilesystemEntry>, String>(output)
  })
  .await
  .map_err(|error| format!("task join error: {}", error))??;

  Ok(DirectorySnapshot {
    path,
    entries,
    source: "native",
  })
}

#[tauri::command]
pub async fn filesystem_list_mounts() -> Vec<String> {
  #[cfg(target_os = "linux")]
  {
    vec!["/".to_string(), "/home".to_string()]
  }

  #[cfg(not(target_os = "linux"))]
  {
    vec!["/".to_string()]
  }
}
