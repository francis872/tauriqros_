import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, ChevronRight } from 'lucide-react'
import { useBalanceStore, selectTasksByStatus, type TaskStatus, type BalanceTask } from './balanceStore'

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
}

function TaskCard({ task, onMove }: { task: BalanceTask; onMove: (id: string, to: TaskStatus) => void }) {
  const nextStatus: Record<TaskStatus, TaskStatus | null> = {
    todo: 'in-progress',
    'in-progress': 'review',
    review: 'done',
    done: null,
  }
  const next = nextStatus[task.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl border border-white/[0.07] bg-slate-800/60 p-3 text-sm"
    >
      <p className="text-slate-100 leading-snug">{task.title}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        <span className="rounded-full bg-slate-700/40 px-2 py-0.5 text-[10px] text-slate-400">
          {task.category}
        </span>
        {task.dueDate && (
          <span className="ml-auto text-[10px] text-slate-500">{task.dueDate}</span>
        )}
      </div>
      {next && (
        <button
          type="button"
          onClick={() => onMove(task.id, next)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-cyan-500/10 py-1 text-[11px] font-medium text-cyan-400 transition hover:bg-cyan-500/20"
        >
          {next === 'done' ? <Check size={11} /> : <ChevronRight size={11} />}
          {next === 'in-progress' ? 'Start' : next === 'review' ? 'Review' : 'Complete'}
        </button>
      )}
    </motion.div>
  )
}

export default function KanbanBoard({ onAddTodo }: { onAddTodo: () => void }) {
  const { tasks, moveTask } = useBalanceStore()

  return (
    <div className="grid h-full grid-cols-4 gap-3 p-4">
      {COLUMNS.map((col) => {
        const colTasks = selectTasksByStatus(tasks, col.id)
        return (
          <div key={col.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {col.label}
              </span>
              {col.id === 'todo' && (
                <button
                  type="button"
                  onClick={onAddTodo}
                  className="flex items-center gap-1 rounded-full bg-cyan-500 px-2.5 py-1 text-[11px] font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  <Plus size={11} />
                  Add
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2 min-h-[60px]">
              <AnimatePresence mode="popLayout">
                {colTasks.length === 0 ? (
                  <p className="text-xs text-slate-600 px-1">Sin tareas</p>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onMove={moveTask} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}
