import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRelayStore, type ConnectionType } from '../relayStore'
import { Plus, X, Trash2, RefreshCw } from 'lucide-react'

const TYPE_ICON: Record<ConnectionType, string> = {
  crm: '👥', erp: '🏭', database: '🗄️', api: '⚡', email: '📧', docs: '📄', slack: '💬', sheets: '📊',
}

const STATUS_CONFIG = {
  connected: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Connected' },
  pending:   { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     label: 'Pending' },
  error:     { text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',          label: 'Error' },
  syncing:   { text: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/30',    label: 'Syncing' },
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

const CONN_TYPES: ConnectionType[] = ['crm', 'erp', 'database', 'api', 'email', 'docs', 'slack', 'sheets']

export default function DataView() {
  const { connections, addConnection, removeConnection } = useRelayStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'crm' as ConnectionType, records: '' })

  function handleAdd() {
    if (!form.name.trim()) return
    addConnection({ name: form.name.trim(), type: form.type, status: 'pending', records: Number(form.records) || 0 })
    setForm({ name: '', type: 'crm', records: '' })
    setShowAdd(false)
  }

  const totalRecords = connections.reduce((s, c) => s + c.records, 0)
  const connected = connections.filter((c) => c.status === 'connected').length

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-5 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-white">Data Layer</h2>
          <p className="text-xs text-slate-500 mt-0.5">{connected}/{connections.length} sources connected · {fmt(totalRecords)} total records indexed</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition"
        >
          <Plus size={12} />
          Add Source
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Records', value: fmt(totalRecords), color: 'text-violet-300' },
          { label: 'Connected', value: `${connected}/${connections.length}`, color: 'text-emerald-400' },
          { label: 'Syncing', value: connections.filter((c) => c.status === 'syncing').length, color: 'text-amber-400' },
          { label: 'Errors', value: connections.filter((c) => c.status === 'error').length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Connections grid */}
      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence>
          {connections.map((conn) => {
            const sc = STATUS_CONFIG[conn.status]
            return (
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-800 text-xl">
                      {TYPE_ICON[conn.type]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{conn.name}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5 capitalize">{conn.type} · {fmt(conn.records)} records</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Eliminar conexión"
                    aria-label="Eliminar conexión"
                    onClick={() => removeConnection(conn.id)}
                    className="text-slate-700 hover:text-red-400 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                    {conn.status === 'syncing' && <RefreshCw size={8} className="animate-spin" />}
                    {sc.label}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {conn.lastSync ? `Synced ${timeAgo(conn.lastSync)}` : 'Never synced'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-zinc-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-white">Connect Data Source</h3>
                <button type="button" title="Cerrar" aria-label="Cerrar" onClick={() => setShowAdd(false)}>
                  <X size={16} className="text-slate-500 hover:text-slate-300" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  placeholder="Source name (e.g. HubSpot CRM)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  title="Source name"
                  aria-label="Source name"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none"
                />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ConnectionType })}
                  title="Source type"
                  aria-label="Source type"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-300 focus:border-violet-500/50 focus:outline-none"
                >
                  {CONN_TYPES.map((t) => <option key={t} value={t}>{TYPE_ICON[t]} {t}</option>)}
                </select>
                <input
                  placeholder="Estimated records (optional)"
                  value={form.records}
                  type="number"
                  onChange={(e) => setForm({ ...form, records: e.target.value })}
                  title="Estimated records"
                  aria-label="Estimated records"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!form.name.trim()}
                  className="w-full rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40 transition"
                >
                  Connect
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
