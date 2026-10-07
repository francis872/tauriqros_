type RuntimeHookEvent = 'session:ready' | 'workflow:resume' | 'runtime:degraded'

type RuntimeHook = (payload: Record<string, unknown>) => void

const hooks: Record<RuntimeHookEvent, Set<RuntimeHook>> = {
  'session:ready': new Set(),
  'workflow:resume': new Set(),
  'runtime:degraded': new Set(),
}

export function onRuntimeHook(event: RuntimeHookEvent, handler: RuntimeHook) {
  hooks[event].add(handler)
  return () => hooks[event].delete(handler)
}

export function emitRuntimeHook(event: RuntimeHookEvent, payload: Record<string, unknown>) {
  hooks[event].forEach((handler) => handler(payload))
}
