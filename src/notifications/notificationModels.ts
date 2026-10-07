export type NotificationTone = 'info' | 'success' | 'warning'

export interface RuntimeNotification {
  id: string
  title: string
  message: string
  tone: NotificationTone
  workspaceId?: string
  createdAt: number
  read: boolean
}
