import { evaluateRuntimeHealth } from '../core/runtimeHealthEngine'
import type { RuntimeServiceNode } from '../core/runtimeCoreModels'

export function runSelfHealingRuntime(services: RuntimeServiceNode[]) {
  const health = evaluateRuntimeHealth(services)

  if (health === 'critical') {
    return {
      healed: false,
      action: 'Escalate to recovery supervisor',
    }
  }

  if (health === 'guarded') {
    return {
      healed: true,
      action: 'Restart degraded services and reduce workload pressure',
    }
  }

  return {
    healed: true,
    action: 'Runtime stable. Watchdog monitoring active',
  }
}
