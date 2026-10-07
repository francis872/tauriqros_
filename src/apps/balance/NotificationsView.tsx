import { useState } from 'react'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type NotifType = 'info' | 'warning' | 'success' | 'error'
type ViewMode = 'visual' | 'text'

interface Notification {
  id: string
  title: string
  message: string
  type: NotifType
  scheduledAt?: string
  createdAt: number
  read: boolean
}

const TYPE_STYLES: Record<NotifType, { bar: string; badge: string }> = {
  info:    { bar: 'bg-cyan-500', badge: 'bg-cyan-500/20 text-cyan-400' },
  warning: { bar: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-400' },
  success: { bar: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400' },
  error:   { bar: 'bg-red-500', badge: 'bg-red-500/20 text-red-400' },
}

const TYPE_LABELS: Record<NotifType, string> = {
  info: 'Info', warning: 'Aviso', success: 'Éxito', error: 'Error',
}

function uid() { return Math.random().toString(36).slice(2, 10) }

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<NotifType>('info')
  const [scheduled, setScheduled] = useState('')
  const [mode, setMode] = useState<ViewMode>('visual')
  const [pushEnabled, setPushEnabled] = useState(false)

  const unread = notifications.filter((n) => !n.read).length

  async function togglePush() {
    if (!pushEnabled) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission()
        if (perm === 'granted') setPushEnabled(true)
      }
    } else {
      setPushEnabled(false)
    }
  }

  function handleCreate() {
    if (!title.trim()) return
    const notif: Notification = {
      id: uid(),
      title: title.trim(),
      message: message.trim(),
      type,
      scheduledAt: scheduled || undefined,
      createdAt: Date.now(),
      read: false,
    }
    setNotifications((prev) => [notif, ...prev])
    if (pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notif.title, { body: notif.message || undefined })
    }
    setTitle('')
    setMessage('')
    setScheduled('')
    setType('info')
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function deleteNotif(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-amber-400">
          🔔 Notificaciones
          {unread > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] p-0.5">
            {(['visual', 'text'] as ViewMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-lg px-3 py-1 text-xs transition ${mode === m ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Modo: {m === 'visual' ? 'Visual' : 'Texto'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={togglePush}
            title={pushEnabled ? 'Desactivar push' : 'Activar push'}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${pushEnabled ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/[0.08] text-slate-400 hover:bg-slate-800'}`}
          >
            {pushEnabled ? <Bell size={12} /> : <BellOff size={12} />}
            {pushEnabled ? 'Push ON' : 'Activar push'}
          </button>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800"
            >
              <CheckCheck size={12} />
              Marcar todo leído
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la notificación"
          aria-label="Título"
          className="w-full rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none"
        />
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensaje (opcional)"
          aria-label="Mensaje"
          className="w-full rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as NotifType)}
            aria-label="Tipo"
            title="Tipo de notificación"
            className="flex-1 rounded-xl border border-white/[0.08] bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            {(Object.keys(TYPE_LABELS) as NotifType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={scheduled}
            onChange={(e) => setScheduled(e.target.value)}
            aria-label="Programar para"
            title="Programar para"
            placeholder="Programar..."
            className="flex-1 rounded-xl border border-white/[0.08] bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!title.trim()}
            className="rounded-xl bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-600 disabled:opacity-40 transition"
          >
            Crear
          </button>
        </div>
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-600">No hay notificaciones</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`relative overflow-hidden rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 ${n.read ? 'opacity-60' : ''}`}
              >
                {mode === 'visual' && (
                  <div className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${TYPE_STYLES[n.type].bar}`} />
                )}
                <div className="flex items-start gap-3 pl-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-100">{n.title}</p>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TYPE_STYLES[n.type].badge}`}>
                        {TYPE_LABELS[n.type]}
                      </span>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                    </div>
                    {n.message && <p className="mt-0.5 text-xs text-slate-400">{n.message}</p>}
                    <p className="mt-1 text-[10px] text-slate-600">
                      {n.scheduledAt ? `Programada: ${n.scheduledAt}` : new Date(n.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteNotif(n.id)}
                    aria-label="Eliminar notificación"
                    title="Eliminar"
                    className="rounded-lg p-1 text-slate-600 hover:text-red-400"
                  >×</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
