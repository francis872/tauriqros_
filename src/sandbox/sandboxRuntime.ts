import { resolveRuntimePolicy } from './runtimePolicyEngine'
import { createIsolatedAppBridge } from './isolatedAppBridge'

export interface SandboxRuntimeSnapshot {
  policyId: string
  bridgeReady: boolean
  cpuLimit: number
  memoryLimit: number
}

export function bootstrapSandboxRuntime(target: 'app' | 'plugin' | 'agent', appId: string): SandboxRuntimeSnapshot {
  const policy = resolveRuntimePolicy(target)
  const bridge = createIsolatedAppBridge(appId)

  return {
    policyId: policy.id,
    bridgeReady: bridge.bridgeReady,
    cpuLimit: policy.maxCpuPercent,
    memoryLimit: policy.maxMemoryMb,
  }
}
