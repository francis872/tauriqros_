type DeviceEvent = {
  type: 'battery' | 'thermal' | 'network' | 'audio' | 'monitor'
  message: string
}

type Handler = (event: DeviceEvent) => void

const handlers = new Set<Handler>()

export function onDeviceEvent(handler: Handler) {
  handlers.add(handler)
  return () => handlers.delete(handler)
}

export function emitDeviceEvent(event: DeviceEvent) {
  handlers.forEach((handler) => handler(event))
}
