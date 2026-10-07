export interface PlannedTask {
  id: string
  label: string
  priority: 'critical' | 'high' | 'normal'
}

export function buildTaskChain(seed: string): PlannedTask[] {
  return [
    { id: `${seed}-observe`, label: 'Observe runtime context', priority: 'critical' },
    { id: `${seed}-stabilize`, label: 'Stabilize active anomalies', priority: 'high' },
    { id: `${seed}-execute`, label: 'Execute focused workflow block', priority: 'normal' },
  ]
}
