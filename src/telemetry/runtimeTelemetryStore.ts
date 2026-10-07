import type { RuntimeTelemetryPoint } from '../core/runtimeCoreModels'

const TELEMETRY_KEY = 'tauriq.runtime-telemetry.v1'

export function loadTelemetryHistory(): RuntimeTelemetryPoint[] {
  try {
    const raw = window.localStorage.getItem(TELEMETRY_KEY)
    if (!raw) {
      return []
    }

    return JSON.parse(raw) as RuntimeTelemetryPoint[]
  } catch {
    return []
  }
}

export function appendTelemetry(point: RuntimeTelemetryPoint) {
  const current = loadTelemetryHistory()
  const next = [point, ...current].slice(0, 60)

  try {
    window.localStorage.setItem(TELEMETRY_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage failure.
  }

  return next
}
