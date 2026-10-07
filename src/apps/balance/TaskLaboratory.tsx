import { useBalanceStore, selectAttentionIndex, type BalanceTask, type OKR } from './balanceStore'

function AttentionIndex({ tasks }: { tasks: BalanceTask[] }) {
  const index = selectAttentionIndex(tasks)
  return (
    <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Índice de Atención
      </p>
      <p className={`text-4xl font-bold ${index >= 80 ? 'text-cyan-400' : index >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
        {index}
      </p>
      <p className="text-xs text-slate-500 mt-1">Penaliza tareas en progreso y retrasos</p>
    </div>
  )
}

function OKRImpactMap({ tasks, okrs }: { tasks: BalanceTask[]; okrs: OKR[] }) {
  const linkedDone = tasks.filter((t) => t.okrId && t.status === 'done').length
  return (
    <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Mapa OKR→Impacto
      </p>
      {okrs.length === 0 ? (
        <p className="text-xs text-slate-500">Sin OKRs</p>
      ) : (
        <div className="space-y-1 text-xs">
          {okrs.map((okr) => {
            const linked = tasks.filter((t) => t.okrId === okr.id && t.status === 'done').length
            const total = tasks.filter((t) => t.okrId === okr.id).length
            return (
              <div key={okr.id} className="flex justify-between text-slate-400">
                <span className="truncate max-w-[140px]">{okr.objective}</span>
                <span className="text-cyan-400 font-semibold">{total ? Math.round((linked / total) * 100) : 0}%</span>
              </div>
            )
          })}
          <p className="text-[10px] text-slate-600 mt-1">{linkedDone} completadas vinculadas</p>
        </div>
      )}
    </div>
  )
}

function FrictionAudit({ tasks }: { tasks: BalanceTask[] }) {
  const blocked = tasks.filter((t) => {
    if (t.status === 'done') return false
    if (!t.dueDate) return false
    return new Date(t.dueDate) < new Date()
  })
  return (
    <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Auditoría de Fricción
      </p>
      {blocked.length === 0 ? (
        <p className="text-xs text-slate-500">Sin bloqueos</p>
      ) : (
        <div className="space-y-1">
          {blocked.map((t) => (
            <p key={t.id} className="text-xs text-amber-400 truncate">• {t.title}</p>
          ))}
          <p className="text-[10px] text-slate-500 mt-1">{blocked.length} tarea(s) vencida(s)</p>
        </div>
      )}
    </div>
  )
}

function PerfectWeek({ tasks }: { tasks: BalanceTask[] }) {
  const todoCount = tasks.filter((t) => t.status === 'todo').length
  return (
    <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Semana Perfecta
      </p>
      {todoCount === 0 ? (
        <p className="text-xs text-emerald-400">No hay tareas en TODO</p>
      ) : (
        <p className="text-xs text-slate-500">{todoCount} tarea(s) pendientes en TODO</p>
      )}
    </div>
  )
}

export default function TaskLaboratory() {
  const { tasks, okrs } = useBalanceStore()

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-base">🧪</span>
        <h2 className="text-sm font-bold text-cyan-400">Laboratorio de Tareas</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AttentionIndex tasks={tasks} />
        <OKRImpactMap tasks={tasks} okrs={okrs} />
        <FrictionAudit tasks={tasks} />
        <PerfectWeek tasks={tasks} />
      </div>
    </div>
  )
}
