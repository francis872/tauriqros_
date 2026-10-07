import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useBalanceStore, type TaskPriority, type TaskCategory } from './balanceStore'

interface AddTodoModalProps {
  open: boolean
  onClose: () => void
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']
const PRIORITY_LABELS: Record<TaskPriority, string> = { low: 'Baja', medium: 'Media', high: 'Alta' }
const CATEGORIES: TaskCategory[] = ['personal', 'work', 'health', 'learning', 'finance']
const CATEGORY_LABELS: Record<TaskCategory, string> = {
  personal: 'Personal',
  work: 'Trabajo',
  health: 'Salud',
  learning: 'Aprendizaje',
  finance: 'Finanzas',
}

export default function AddTodoModal({ open, onClose }: AddTodoModalProps) {
  const addTask = useBalanceStore((s) => s.addTask)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [category, setCategory] = useState<TaskCategory>('personal')
  const [dueDate, setDueDate] = useState('')

  function handleSubmit() {
    if (!title.trim()) return
    addTask({ title: title.trim(), priority, category, status: 'todo', dueDate: dueDate || undefined })
    setTitle('')
    setPriority('medium')
    setCategory('personal')
    setDueDate('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-slate-900 p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Crea tu nuevo TODO</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                title="Cerrar"
                className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
              >
                <X size={14} />
              </button>
            </div>

            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Crea tu nuevo todo..."
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              rows={3}
              onKeyDown={(e) => e.key === 'Enter' && e.metaKey && handleSubmit()}
            />

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-[11px] text-slate-500">Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  aria-label="Prioridad"
                  title="Prioridad"
                  className="w-full rounded-lg border border-white/[0.08] bg-slate-800 px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-slate-500">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  aria-label="Categoría"
                  title="Categoría"
                  className="w-full rounded-lg border border-white/[0.08] bg-slate-800 px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-slate-500">Fecha límite</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  aria-label="Fecha límite"
                  title="Fecha límite"
                  placeholder="dd/mm/aaaa"
                  className="w-full rounded-lg border border-white/[0.08] bg-slate-800 px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="rounded-xl bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-600 disabled:opacity-40"
              >
                Añadir
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
