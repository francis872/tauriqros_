import { useBalanceStore, selectAttentionIndex, selectCompletionRate } from './balanceStore'
import { useDexStore } from './dexStore'

function MetricCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
      <p className="mb-3 text-xs font-semibold text-slate-300">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  )
}

export default function StrategyCenter() {
  const { tasks, okrs, moves } = useBalanceStore()
  const { contacts, messages } = useDexStore()

  const attentionIdx = selectAttentionIndex(tasks)
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length
  const overdue = tasks.filter((t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date()).length
  const okrLinked = tasks.filter((t) => t.okrId).length
  const okrPct = tasks.length ? Math.round((okrLinked / tasks.length) * 100) : 0

  const completedTasks = tasks.filter((t) => t.status === 'done')
  const skillCategories = [...new Set(completedTasks.map((t) => t.category))]
  const expert = skillCategories.filter((c) => completedTasks.filter((t) => t.category === c).length >= 6).length
  const intermediate = skillCategories.filter((c) => {
    const n = completedTasks.filter((t) => t.category === c).length
    return n >= 3 && n < 6
  }).length

  const inReview = tasks.filter((t) => t.status === 'review').length
  const done = completedTasks.length
  const reviewRatio = done ? Math.round((inReview / done) * 100) : 0

  const today = new Date().toISOString().slice(0, 10)
  const todayMoves = moves.filter((m) => new Date(m.movedAt).toISOString().slice(0, 10) === today).length
  const unreadMessages = messages.filter((m) => !m.read && !m.fromMe).length

  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <div className="flex items-center gap-2">
        <span className="text-base">⏱️</span>
        <h2 className="text-sm font-bold text-cyan-400">Centro de Estrategia</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <MetricCard title="Estrategia">
          <div className="space-y-2">
            <Row label="Alineación OKR" value={`${okrPct}%`} />
            <Row label="OKRs activos" value={okrs.length} />
            <p className="mt-2 text-[10px] text-slate-600">Porcentaje de tareas vinculadas a OKR.</p>
          </div>
        </MetricCard>

        <MetricCard title="Energía / Foco">
          <p className={`mb-2 text-3xl font-bold ${attentionIdx >= 80 ? 'text-cyan-400' : attentionIdx >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {attentionIdx}
          </p>
          <div className="space-y-2">
            <Row label="En progreso" value={inProgress} />
            <Row label="Retrasos" value={overdue} />
          </div>
          <p className="mt-2 text-[10px] text-slate-600">Menos carga = mejor foco.</p>
        </MetricCard>

        <MetricCard title="Aprendizaje">
          <div className="space-y-2">
            <Row label="Total skills" value={skillCategories.length} />
            <Row label="Expertas" value={expert} />
            <Row label="Intermedias" value={intermediate} />
          </div>
          <p className="mt-2 text-[10px] text-slate-600">Portfolio activo desde tareas completadas.</p>
        </MetricCard>

        <MetricCard title="Colaboración">
          <div className="space-y-2">
            <Row label="Contactos" value={contacts.length} />
            <Row label="Mensajes" value={unreadMessages > 0 ? `${unreadMessages} sin leer` : messages.length} />
            <Row label="Actividad hoy" value={todayMoves} />
          </div>
          <p className="mt-2 text-[10px] text-slate-600">Datos sincronizados con Dex.</p>
        </MetricCard>

        <MetricCard title="Control de Calidad">
          <div className="space-y-2">
            <Row label="En revisión" value={inReview} />
            <Row label="Completadas" value={done} />
            <Row label="Ratio revisión" value={`${reviewRatio}%`} />
          </div>
          <p className="mt-2 text-[10px] text-slate-600">Cuida la etapa de revisión.</p>
        </MetricCard>

        <MetricCard title="Completación global">
          <p className={`text-3xl font-bold ${selectCompletionRate(tasks) > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
            {selectCompletionRate(tasks)}%
          </p>
          <div className="mt-2 space-y-1">
            <Row label="Total tareas" value={tasks.length} />
            <Row label="Completadas" value={done} />
          </div>
        </MetricCard>
      </div>
    </div>
  )
}
