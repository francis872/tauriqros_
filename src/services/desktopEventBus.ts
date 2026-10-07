type DesktopEvents = {
  'launcher:toggle': undefined
  'launcher:open': undefined
  'launcher:close': undefined
  'ai:center': undefined
  'workspace:switch': { workspaceId: string }
  'app:open': { appId: string }
  'workflow:trigger': { workflowId: string }
  'notification:push': { title: string; message: string; tone: 'info' | 'success' | 'warning' }
  'system:action': { action: string }
}

type EventKey = keyof DesktopEvents

type EventHandler<T extends EventKey> = (payload: DesktopEvents[T]) => void

class DesktopEventBus {
  private handlers: { [K in EventKey]: Set<EventHandler<K>> } = {
    'launcher:toggle': new Set(),
    'launcher:open': new Set(),
    'launcher:close': new Set(),
    'ai:center': new Set(),
    'workspace:switch': new Set(),
    'app:open': new Set(),
    'workflow:trigger': new Set(),
    'notification:push': new Set(),
    'system:action': new Set(),
  }

  on<T extends EventKey>(eventName: T, handler: EventHandler<T>) {
    this.handlers[eventName].add(handler as never)

    return () => {
      this.handlers[eventName].delete(handler as never)
    }
  }

  emit<T extends EventKey>(eventName: T, payload: DesktopEvents[T]) {
    this.handlers[eventName].forEach((handler) => {
      ;(handler as EventHandler<T>)(payload)
    })
  }
}

export const desktopEventBus = new DesktopEventBus()
