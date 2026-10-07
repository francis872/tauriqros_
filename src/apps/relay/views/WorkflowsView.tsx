import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRelayStore, type WorkflowStatus } from '../relayStore'
import { Plus, Play, Pause, Trash2, X, Zap } from 'lucide-react'

const STATUS_CONFIG: Record<WorkflowStatus, { dot: string; text: string; bg: string; label: string }> = {
  active:  { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Active' },
  paused:  { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',    label: 'Paused' },
  draft:   { dot: 'bg-zinc-500',    text: 'text-zinc-400',    bg: 'bg-zinc-800/60 border-zinc-700',          label: 'Draft' },
  error:   { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',         label: 'Error' },
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function WorkflowsView() {
  const { workflows, addWorkflow, toggleWorkflow, runWorkflow, deleteWorkflow } = useRelayStore()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<WorkflowStatus | 'all'>('all')
  const [form, setForm] = useState({ name: '', description: '', trigger: '', steps: '3' })

  function handleCreate() {
    if (!form.name.trim()) return
    addWorkflow({
      name: form.name.trim(),
      description: form.description,
      status: 'draft',
      trigger: form.trigger || 'Manual',
      steps: Number(form.steps) || 3,
    })
    setForm({ name: '', description: '', trigger: '', steps: '3' })
    setShowCreate(false)
  }

  const filtered = filter === 'all' ? workflows : workflows.filter((w) => w.status === filter)
  const totalRuns = workflows.reduce((s, w) => s + w.runs, 0)

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-5 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-white">Workflow Automation</h2>
          <p className="text-xs text-slate-500 mt-0.5">{workflows.length} workflows · {totalRuns.toLocaleString()} total executions</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition"
        >
          <Plus size={12} />
          New Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Active', value: workflows.filter((w) => w.status === 'active').length, color: 'text-emerald-400' },
          { label: 'Paused', value: workflows.filter((w) => w.status === 'paused').length, color: 'text-amber-400' },
          { label: 'Draft', value: workflows.filter((w) => w.status === 'draft').length, color: 'text-zinc-400' },
          { label: 'Total Runs', value: totalRuns.toLocaleString(), color: 'text-violet-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-4">
        {(['all', 'active', 'paused', 'draft'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1 text-[11px] font-medium capitalize transition ${filter === f ? 'bg-violet-600/20 text-violet-300' : 'text-slate-600 hover:text-slate-400'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Workflow list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {filtered.map((wf) => {
            const sc = STATUS_CONFIG[wf.status]
            return (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-800">
                      <Zap size={14} className="text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-200 truncate">{wf.name}</p>
                        <span className={`inline-flex items-center gap-1 flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`h-1 w-1 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{wf.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-600">
                        <span>⚡ {wf.trigger}</span>
                        <span>◈ {wf.steps} steps</span>
                        <span>▶ {wf.runs.toLocaleString()} runs</span>
                        {wf.lastRun && <span>🕐 {timeAgo(wf.lastRun)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                    <button
                      type="button"
                      title="Run workflow"
                      aria-label="Run workflow"
                      onClick={() => runWorkflow(wf.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition"
                    >
                      <Play size={11} />
                    </button>
                    <button
                      type="button"
                      title={wf.status === 'active' ? 'Pause' : 'Activate'}
                      aria-label={wf.status === 'active' ? 'Pause' : 'Activate'}
                      onClick={() => toggleWorkflow(wf.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition"
                    >
                      {wf.status === 'active' ? <Pause size={11} /> : <Play size={11} />}
                    </button>
                    <button
                      type="button"
                      title="Delete workflow"
                      aria-label="Delete workflow"
                      onClick={() => deleteWorkflow(wf.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-slate-700 hover:text-red-400 hover:border-red-500/30 transition"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
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
              className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-white">New Workflow</h3>
                <button type="button" title="Cerrar" aria-label="Cerrar" onClick={() => setShowCreate(false)}>
                  <X size={16} className="text-slate-500 hover:text-slate-300" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  placeholder="Workflow name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  title="Workflow name"
                  aria-label="Workflow name"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none"
                />
                <input
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  title="Workflow description"
                  aria-label="Workflow description"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none"
                />
                <input
                  placeholder="Trigger (e.g. New CRM Contact)"
                  value={form.trigger}
                  onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                  title="Workflow trigger"
                  aria-label="Workflow trigger"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none"
                />
                <input
                  placeholder="Steps"
                  type="number"
                  value={form.steps}
                  onChange={(e) => setForm({ ...form, steps: e.target.value })}
                  title="Workflow steps"
                  aria-label="Workflow steps"
                  min={1}
                  max={20}
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!form.name.trim()}
                  className="w-full rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40 transition"
                >
                  Create Workflow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
