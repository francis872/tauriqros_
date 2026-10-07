import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, Trash2 } from 'lucide-react'

export interface ActivityRecord {
  id: string
  type: 'window-open' | 'window-close' | 'workspace-switch' | 'file-open' | 'task-complete'
  title: string
  description?: string
  timestamp: number
  emoji?: string
}

interface ActivityTimelineProps {
  open: boolean
  onClose: () => void
  activities: ActivityRecord[]
  onClearActivities: () => void
}

export default function ActivityTimeline({
  open,
  onClose,
  activities,
  onClearActivities,
}: ActivityTimelineProps) {
  const [displayActivities, setDisplayActivities] = useState<ActivityRecord[]>(activities)

  useEffect(() => {
    setDisplayActivities(activities)
  }, [activities])

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

  const getActivityIcon = (type: ActivityRecord['type']) => {
    switch (type) {
      case 'window-open': return '📂'
      case 'window-close': return '✕'
      case 'workspace-switch': return '🔀'
      case 'file-open': return '📄'
      case 'task-complete': return '✓'
      default: return '○'
    }
  }

  // Group activities by date
  const groupedActivities = displayActivities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(activity)
    return acc
  }, {} as Record<string, ActivityRecord[]>)

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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-cyan-300" />
                  <h2 className="text-sm font-semibold text-cyan-100">Activity Timeline</h2>
                </div>
                <div className="flex items-center gap-2">
                  {displayActivities.length > 0 && (
                    <button
                      onClick={onClearActivities}
                      className="p-1 text-slate-400 hover:text-red-300 transition-colors"
                      title="Clear all activities"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1 text-slate-400 hover:text-cyan-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {displayActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Clock size={32} className="opacity-30 mb-2" />
                  <p className="text-xs text-center">No activities yet</p>
                </div>
              ) : (
                <div className="p-4 space-y-6">
                  {Object.entries(groupedActivities).map(([date, items]) => (
                    <div key={date}>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 px-2">
                        {date}
                      </p>
                      <div className="space-y-2">
                        <AnimatePresence>
                          {items.map((activity) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 px-3 py-2.5 hover:border-cyan-300/40 hover:bg-cyan-300/10 transition-all cursor-pointer group"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-lg flex-shrink-0">
                                  {activity.emoji || getActivityIcon(activity.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-cyan-100 truncate">
                                    {activity.title}
                                  </p>
                                  {activity.description && (
                                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                                      {activity.description}
                                    </p>
                                  )}
                                  <p className="text-[9px] text-slate-500 mt-1.5">
                                    {formatTime(activity.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-cyan-200/10 bg-[#0d1220]/50 px-4 py-3">
              <p className="text-[10px] text-slate-500 text-center">
                Showing {displayActivities.length} activities
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
