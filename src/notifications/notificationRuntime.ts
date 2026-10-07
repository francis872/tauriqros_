import type { RuntimeNotification, NotificationTone } from './notificationModels'

const NOTIFICATION_KEY = 'tauriq.notifications.v1'

function loadPersisted(): RuntimeNotification[] {
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_KEY)
    if (!raw) {
      return []
    }
    return JSON.parse(raw) as RuntimeNotification[]
  } catch {
    return []
  }
}

function persist(notifications: RuntimeNotification[]) {
  try {
    window.localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications.slice(0, 64)))
  } catch {
    // Ignore storage write errors.
  }
}

export function pushRuntimeNotification(input: {
  title: string
  message: string
  tone: NotificationTone
  workspaceId?: string
}) {
  const current = loadPersisted()
  const next: RuntimeNotification = {
    id: `notif-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    title: input.title,
    message: input.message,
    tone: input.tone,
    workspaceId: input.workspaceId,
    createdAt: Date.now(),
    read: false,
  }

  const notifications = [next, ...current]
  persist(notifications)
  return notifications
}

export function getRuntimeNotifications() {
  return loadPersisted()
}

export function markAllNotificationsRead() {
  const next = loadPersisted().map((notification) => ({ ...notification, read: true }))
  persist(next)
  return next
}
