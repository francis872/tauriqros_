export interface RuntimePolicy {
  id: string
  maxCpuPercent: number
  maxMemoryMb: number
  allowsNetwork: boolean
  allowsFilesystemWrite: boolean
}

export function resolveRuntimePolicy(target: 'app' | 'plugin' | 'agent'): RuntimePolicy {
  if (target === 'agent') {
    return {
      id: 'agent-policy',
      maxCpuPercent: 30,
      maxMemoryMb: 1024,
      allowsNetwork: true,
      allowsFilesystemWrite: false,
    }
  }

  if (target === 'plugin') {
    return {
      id: 'plugin-policy',
      maxCpuPercent: 20,
      maxMemoryMb: 512,
      allowsNetwork: false,
      allowsFilesystemWrite: false,
    }
  }

  return {
    id: 'app-policy',
    maxCpuPercent: 55,
    maxMemoryMb: 2048,
    allowsNetwork: true,
    allowsFilesystemWrite: true,
  }
}
