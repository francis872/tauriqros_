export function captureGpuRuntimeTelemetry() {
  const utilization = 42 + Math.round(Math.random() * 34)
  const vramUsedMb = 2048 + Math.round(Math.random() * 1536)
  const thermalC = 58 + Math.round(Math.random() * 16)

  return {
    utilization,
    vramUsedMb,
    thermalC,
  }
}
