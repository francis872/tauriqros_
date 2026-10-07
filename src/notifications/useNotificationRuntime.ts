import { useEffect, useMemo, useState } from 'react'
import type { RuntimeNotification } from './notificationModels'
import {
  getRuntimeNotifications,
  markAllNotificationsRead,
  pushRuntimeNotification,
} from './notificationRuntime'

export function useNotificationRuntime() {
  const [notifications, setNotifications] = useState<RuntimeNotification[]>(() => getRuntimeNotifications())

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(getRuntimeNotifications())
    }, 2500)

    return () => clearInterval(timer)
  }, [])

  return {
    notifications,
    unreadCount,
    notify: (input: { title: string; message: string; tone: 'info' | 'success' | 'warning'; workspaceId?: string }) => {
      const next = pushRuntimeNotification(input)
      setNotifications(next)
    },
    markAllRead: () => {
      const next = markAllNotificationsRead()
      setNotifications(next)
    },
  }
}
