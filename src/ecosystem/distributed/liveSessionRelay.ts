export interface SessionHandoffSignal {
  sourceDevice: string
  targetDevice: string
  state: 'prepared' | 'transferred'
}

export function prepareLiveSessionRelay(sourceDevice: string, targetDevice: string): SessionHandoffSignal {
  return {
    sourceDevice,
    targetDevice,
    state: 'prepared',
  }
}
