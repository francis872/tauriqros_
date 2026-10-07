export type KernelState =
  | 'boot'
  | 'idle'
  | 'observing'
  | 'planning'
  | 'executing'
  | 'adapting'
  | 'healing'
  | 'degraded'

export interface StateMachineTransition {
  from: KernelState
  to: KernelState
  trigger: string
  timestamp: number
}

let _currentState: KernelState = 'observing'
let _transitionHistory: StateMachineTransition[] = []

export function transitionKernelState(
  trigger: string,
  context: {
    anomalyCount: number
    healingActive: boolean
    executionPressure: number
    intentConfidence: number
  },
): KernelState {
  const { anomalyCount, healingActive, executionPressure, intentConfidence } = context
  const prev = _currentState
  let next: KernelState = _currentState

  if (healingActive || anomalyCount > 4) {
    next = 'healing'
  } else if (executionPressure > 0.85) {
    next = 'degraded'
  } else if (executionPressure > 0.6) {
    next = 'adapting'
  } else if (intentConfidence > 0.7) {
    next = 'executing'
  } else if (intentConfidence > 0.4) {
    next = 'planning'
  } else {
    next = 'observing'
  }

  if (next !== prev) {
    const t: StateMachineTransition = { from: prev, to: next, trigger, timestamp: Date.now() }
    _transitionHistory = [t, ..._transitionHistory.slice(0, 9)]
    _currentState = next
  }

  return _currentState
}

export function getKernelState(): KernelState {
  return _currentState
}

export function getTransitionHistory(): StateMachineTransition[] {
  return _transitionHistory
}
