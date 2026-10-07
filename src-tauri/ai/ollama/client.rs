pub fn endpoint() -> &'static str {
  "http://127.0.0.1:11434"
}

pub fn transport_modes() -> Vec<&'static str> {
  vec!["local", "hybrid", "peer"]
}
