import { useState } from 'react'
import {
  useBalanceStore,
  selectCompletionRate,
  selectConsistency,
  selectAvgTime,
  selectOKRRate,
  selectAttentionIndex,
} from './balanceStore'
import { useFinanceStore, selectTotals, selectBudgetDeviation } from './financeStore'

export default function ExecutionProfile() {
  const { tasks, okrs, moves, totalPoints, todayPoints } = useBalanceStore()
  const { transactions } = useFinanceStore()
  const [labOpen, setLabOpen] = useState(true)

  const completed = tasks.filter((t) => t.status === 'done').length
  const total = tasks.length
  const completionRate = selectCompletionRate(tasks)
  const consistency = selectConsistency(moves)
  const avgTime = selectAvgTime(tasks)
  const okrRate = selectOKRRate(tasks, okrs)
  const attentionIndex = selectAttentionIndex(tasks)
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length
  const inReview = tasks.filter((t) => t.status === 'review').length

  // Finance data
  const { income, balance: finBalance } = selectTotals(transactions)
  const budgetDev = selectBudgetDeviation(transactions)

  // Crisis simulator
  const [crisisPct, setCrisisPct] = useState(20)
  const simulatedBalance = finBalance * (1 - crisisPct / 100)

  // Motor de hábitos (moves in last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentMoves = moves.filter((m) => m.movedAt > sevenDaysAgo)
  const habitScore = recentMoves.length

  // Galaxia de competencias
  const completedTasks = tasks.filter((t) => t.status === 'done')
  const skillCats = [...new Set(completedTasks.map((t) => t.category))]
  const expertSkills = skillCats.filter((c) => completedTasks.filter((t) => t.category === c).length >= 6).length

  // Blocked tasks (friction)
  const blocked = tasks.filter((t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date())

  // Level based on total points
  const level = Math.max(1, Math.floor(totalPoints / 50))

  return (
    <div className="flex flex-col gap-3 text-sm">
      {/* Score */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Execution Profile
        </span>
        <span className="text-lg font-bold text-violet-400">{level}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1 text-center">
        <Stat label="Completed" value={`${completed}/${total}`} />
        <Stat label="Avg time" value={avgTime ?? '-'} />
        <Stat label="Consistency" value={`${consistency}%`} />
        <Stat label="OKR Rate" value={`${okrRate}%`} />
      </div>

      {/* Impact breakdown */}
      <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 text-xs space-y-1">
        <p className="font-semibold text-slate-300 mb-1">Impact breakdown</p>
        <Row label="OKR" value={`${okrRate}%`} />
        <Row label="Consistency" value={`${consistency}%`} />
        <Row label="Completion" value={`${completionRate}%`} />
        <Row label="SpeedScore" value={avgTime ? '100%' : '50%'} />
      </div>

      {/* Today points */}
      <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 text-xs">
        <p className="font-semibold text-slate-300">Hoy: {todayPoints} pts · Total: {totalPoints}</p>
        <p className="text-slate-500 mt-0.5 text-[10px]">TODO→Progress: +5 · Progress→Review: +15 · Review→Done: +30</p>
      </div>

      {/* Laboratorio Estratégico toggle */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400">Laboratorio Estratégico</p>
        <button
          type="button"
          onClick={() => setLabOpen((v) => !v)}
          className="rounded-lg border border-white/[0.08] px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-800"
        >
          {labOpen ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {labOpen && (
        <>
          {/* Attention index */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3">
            <p className="text-[10px] font-semibold text-slate-400 mb-1">Índice de Atención</p>
            <p className={`text-2xl font-bold ${attentionIndex >= 80 ? 'text-cyan-400' : attentionIndex >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {attentionIndex}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Penaliza tareas en progreso y retrasos</p>
          </div>

          {/* Radar de Deriva */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 text-xs space-y-1">
            <p className="font-semibold text-slate-400 mb-1">Radar de Deriva</p>
            {[
              { label: 'Necesidades', val: budgetDev.needs },
              { label: 'Deseos', val: budgetDev.wants },
              { label: 'Ahorro', val: budgetDev.savings },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className={val < 0 ? 'text-red-400' : 'text-emerald-400'}>{val > 0 ? '+' : ''}{val}%</span>
              </div>
            ))}
            <p className="text-[10px] text-slate-600 mt-0.5">Comparado con regla 50/30/20</p>
          </div>

          {/* Mapa OKR→Caja */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 text-xs">
            <p className="font-semibold text-slate-400 mb-1">Mapa OKR→Caja</p>
            {okrs.length === 0 ? (
              <p className="text-slate-600">Sin OKRs</p>
            ) : (
              <p className="text-slate-500">{okrs.length} OKR(s) · impacto estimado por prioridad</p>
            )}
          </div>

          {/* Simulador de Crisis */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 text-xs space-y-2">
            <p className="font-semibold text-slate-400">Simulador de Crisis</p>
            <p className="text-slate-500">Caída de ingresos: {crisisPct}%</p>
            <input
              type="range"
              min={0}
              max={100}
              value={crisisPct}
              onChange={(e) => setCrisisPct(Number(e.target.value))}
              aria-label="Caída de ingresos"
              title="Caída de ingresos"
              className="w-full accent-cyan-500"
            />
            <Row label="Balance actual" value={`$${(income - Math.abs(selectTotals(transactions).expense)).toFixed(2)}`} />
            <Row label="Balance simulado" value={`$${simulatedBalance.toFixed(2)}`} />
          </div>

          {/* Motor de Hábitos */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 text-xs">
            <p className="font-semibold text-slate-400 mb-1">Motor de Hábitos</p>
            <p className={`text-2xl font-bold ${habitScore > 5 ? 'text-cyan-400' : habitScore > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
              {habitScore}
            </p>
            <p className="text-[10px] text-slate-500">Basado en actividad de 7 días</p>
          </div>

          {/* Galaxia de Competencias */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 text-xs space-y-1">
            <p className="font-semibold text-slate-400 mb-1">Galaxia de Competencias</p>
            <Row label="Total" value={skillCats.length} />
            <Row label="Expertas" value={expertSkills} />
            <p className="text-[10px] text-slate-600">Basado en tareas completadas</p>
          </div>

          {/* Auditoría de Fricción */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 text-xs">
            <p className="font-semibold text-slate-400 mb-1">Auditoría de Fricción</p>
            {blocked.length === 0 ? (
              <p className="text-slate-600">Sin bloqueos</p>
            ) : (
              <p className="text-amber-400">{blocked.length} tarea(s) vencida(s)</p>
            )}
          </div>

          {/* Semana Perfecta */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 text-xs">
            <p className="font-semibold text-slate-400 mb-1">Semana Perfecta</p>
            {tasks.filter((t) => t.status === 'todo').length === 0 ? (
              <p className="text-emerald-400">No hay tareas en TODO</p>
            ) : (
              <p className="text-slate-500">{tasks.filter((t) => t.status === 'todo').length} pendientes en TODO</p>
            )}
          </div>

          {/* Quick flow */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-3 text-xs space-y-1">
            <p className="font-semibold text-slate-300">Estado de Flujo</p>
            <Row label="En progreso" value={inProgress} />
            <Row label="En revisión" value={inReview} />
            <Row label="Completadas" value={completed} />
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-slate-500 leading-none">{label}</span>
      <span className="text-xs font-semibold text-slate-200 leading-none">{value}</span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-slate-400">
      <span>{label}</span>
      <span className="text-slate-300">{value}</span>
    </div>
  )
}
