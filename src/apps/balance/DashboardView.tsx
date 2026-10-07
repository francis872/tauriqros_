import { useState } from 'react'
import { useBalanceStore, selectCompletionRate, type BalanceTask } from './balanceStore'

function ScoreCircle({ score }: { score: number }) {
  const max = Math.max(score, 50)
  const r = 40
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(1, score / max))
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg width={96} height={96} className="-rotate-90">
        <circle cx={48} cy={48} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle cx={48} cy={48} r={r} fill="none" stroke="#ef4444" strokeWidth={6}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute text-2xl font-bold text-slate-100">{score}</span>
    </div>
  )
}

function FlowChart({ tasks, type }: { tasks: BalanceTask[]; type: 'bar' | 'line' }) {
  const data = [
    { label: 'To Do', count: tasks.filter((t) => t.status === 'todo').length, color: 'bg-slate-500' },
    { label: 'In Progress', count: tasks.filter((t) => t.status === 'in-progress').length, color: 'bg-cyan-500' },
    { label: 'Review', count: tasks.filter((t) => t.status === 'review').length, color: 'bg-amber-500' },
    { label: 'Done', count: tasks.filter((t) => t.status === 'done').length, color: 'bg-emerald-500' },
  ]
  const max = Math.max(...data.map((d) => d.count), 1)

  if (type === 'line') {
    return (
      <div className="mt-4 flex items-center gap-6">
        {data.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${d.color}`} />
            <span className="text-xs font-semibold text-slate-200">{d.count}</span>
            <span className="text-[10px] text-slate-500">{d.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4 flex h-28 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs text-slate-300">{d.count}</span>
          <div
            className={`w-full rounded-t-lg ${d.color} transition-all`}
            style={{ height: `${(d.count / max) * 72}px`, minHeight: d.count > 0 ? 4 : 0 }}
          />
          <span className="text-[10px] text-slate-500 text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardView() {
  const { tasks, moves, todayPoints } = useBalanceStore()
  const completionRate = selectCompletionRate(tasks)
  const completed = tasks.filter((t) => t.status === 'done').length
  const today = new Date().toISOString().slice(0, 10)
  const todayMoves = moves.filter((m) => new Date(m.movedAt).toISOString().slice(0, 10) === today).length
  const [dashCollapsed, setDashCollapsed] = useState(false)
  const [flowCollapsed, setFlowCollapsed] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-cyan-400">
          📊 Dashboard de Desempeño
        </h2>
        <button
          type="button"
          onClick={() => setDashCollapsed((v) => !v)}
          className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800"
        >
          {dashCollapsed ? 'Desplegar dashboard' : 'Plegar dashboard'}
        </button>
      </div>

      {!dashCollapsed && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
            <p className="mb-3 text-[10px] uppercase tracking-wider text-slate-500">PUNTUACIÓN DE HOY</p>
            <div className="flex items-center gap-4">
              <ScoreCircle score={todayPoints} />
              <p className="text-xs text-slate-400">Ganas puntos al mover tareas en el flujo</p>
            </div>
            <p className="mt-2 text-[10px] text-slate-600">
              TODO→Progress: +5 · Progress→Review: +15 · Review→Done: +30
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
            <p className="mb-3 text-[10px] uppercase tracking-wider text-slate-500">COMPLETACIÓN</p>
            <p className={`text-3xl font-bold ${completionRate > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
              {completionRate}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {completed} de {tasks.length} tareas completadas
            </p>
          </div>
        </div>
      )}

      {!dashCollapsed && (
        <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm font-semibold text-slate-200">Actividad Hoy</p>
              <p className={`text-xl font-bold ${todayMoves > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                {todayMoves} acciones
              </p>
              <p className="text-xs text-slate-500">
                {todayMoves === 0 ? 'Sin actividad aún' : `${todayMoves} movimientos en el kanban`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-cyan-400">Estado del Flujo</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFlowCollapsed((v) => !v)}
              className="rounded-lg border border-white/[0.08] px-3 py-1 text-xs text-slate-400 hover:bg-slate-800"
            >
              {flowCollapsed ? 'Desplegar' : 'Plegar'} estado de flujo
            </button>
            {!flowCollapsed && (
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'bar' | 'line')}
                aria-label="Tipo de gráfica"
                title="Tipo de gráfica"
                className="rounded-lg border border-white/[0.08] bg-slate-800 px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="bar">Barras</option>
                <option value="line">Líneas</option>
              </select>
            )}
          </div>
        </div>
        {!flowCollapsed && (
          <>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">TAREAS POR ESTADO</p>
            <FlowChart tasks={tasks} type={chartType} />
          </>
        )}
      </div>
    </div>
  )
}
