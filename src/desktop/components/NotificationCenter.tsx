import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  read: boolean
  actionUrl?: string
}

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllRead: () => void
  onDismiss: (id: string) => void
  onDismissAll: () => void
}

export default function NotificationCenter({
  open,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllRead,
  onDismiss,
  onDismissAll,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - timestamp
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-300" />
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-300" />
      case 'error':
        return <AlertCircle size={16} className="text-red-300" />
      case 'info':
      default:
        return <Info size={16} className="text-cyan-300" />
    }
  }

  const getColorClass = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-300/20 bg-green-300/5'
      case 'warning':
        return 'border-yellow-300/20 bg-yellow-300/5'
      case 'error':
        return 'border-red-300/20 bg-red-300/5'
      case 'info':
      default:
        return 'border-cyan-300/20 bg-cyan-300/5'
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-14 bottom-0 z-50 w-96 border-l border-cyan-200/10 bg-[#0a0f1a]/95 backdrop-blur-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-cyan-200/10 bg-[#0d1220]/70 px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-cyan-300" />
                  <h2 className="text-sm font-semibold text-cyan-100">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-cyan-300/20 text-xs font-semibold text-cyan-100">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-cyan-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wide transition-colors ${
                    filter === 'all'
                      ? 'bg-cyan-300/20 text-cyan-100'
                      : 'text-slate-400 hover:text-cyan-100'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wide transition-colors ${
                    filter === 'unread'
                      ? 'bg-cyan-300/20 text-cyan-100'
                      : 'text-slate-400 hover:text-cyan-100'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Bell size={32} className="opacity-30 mb-2" />
                  <p className="text-xs text-center">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => onMarkAsRead(notification.id)}
                        className={`relative rounded-lg border px-3 py-3 cursor-pointer hover:border-cyan-300/50 transition-all ${getColorClass(
                          notification.type
                        )} ${!notification.read ? 'border-cyan-300/40 bg-cyan-300/10' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {getIconForType(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-cyan-100">
                              {notification.title}
                            </p>
                            <p className="text-[10px] text-slate-300 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-[9px] text-slate-500 mt-1.5">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDismiss(notification.id)
                            }}
                            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        {!notification.read && (
                          <div className="absolute left-1 top-2 w-1.5 h-1.5 rounded-full bg-cyan-300" />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {notifications.length > 0 && (
              <div className="flex-shrink-0 border-t border-cyan-200/10 bg-[#0d1220]/50 px-4 py-3 flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="flex-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wide rounded-md border border-cyan-300/30 text-cyan-100 hover:bg-cyan-300/10 transition-colors"
                  >
                    Mark All Read
                  </button>
                )}
                <button
                  onClick={onDismissAll}
                  className="flex-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wide rounded-md border border-red-300/30 text-red-300 hover:bg-red-300/10 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
