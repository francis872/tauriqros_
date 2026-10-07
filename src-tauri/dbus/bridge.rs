pub const DBUS_RUNTIME_STATE: &str = "scaffolded";

pub fn service_targets() -> [&'static str; 6] {
  [
    "org.freedesktop.login1",
    "org.freedesktop.UPower",
    "org.freedesktop.Notifications",
    "org.bluez",
    "org.freedesktop.NetworkManager",
    "org.freedesktop.portal.Desktop",
  ]
}
