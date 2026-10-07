pub const WAYLAND_INTEGRATION_STATE: &str = "prototype-ready";

pub fn planned_protocols() -> [&'static str; 4] {
  [
    "xdg-shell",
    "layer-shell",
    "xdg-output",
    "xdg-activation",
  ]
}
