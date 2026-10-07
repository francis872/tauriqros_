import { motion } from 'framer-motion'
import { useBalanceStore } from './balanceStore'

const STATUS_DOT: Record<string, string> = {
  todo: 'bg-slate-500',
  'in-progress': 'bg-cyan-500',
  review: 'bg-amber-500',
  done: 'bg-emerald-500',
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#64748b',
  'in-progress': '#22d3ee',
  review: '#f59e0b',
  done: '#10b981',
}

export default function CanvasView() {
  const { tasks, okrs, totalPoints } = useBalanceStore()

  if (okrs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8">
        <span className="text-4xl">🚀</span>
        <h2 className="text-base font-bold text-cyan-400">Neuro-Execution Canvas</h2>
        <p className="text-center text-sm text-slate-500">No hay OKRs creados aún.</p>
        <p className="text-center text-xs text-slate-600">Crea un OKR para visualizar el sistema orbital de tareas.</p>
      </div>
    )
  }

  const cx = 250
  const cy = 250
  const baseRadius = 80
  const radiiStep = 65

  return (
    <div className="flex h-full flex-col items-center overflow-hidden p-4">
      <div className="mb-4 text-center">
        <h2 className="text-base font-bold text-cyan-400">🚀 Neuro-Execution Canvas</h2>
        <p className="text-xs text-slate-500">{okrs.length} OKR(s) activos · {tasks.length} tareas en órbita</p>
      </div>

      <div className="relative flex-1 w-full max-w-[500px]">
        <svg viewBox="0 0 500 500" className="w-full h-full max-h-[480px]">
          {/* Stars */}
          {Array.from({ length: 40 }).map((_, i) => (
            <circle
              key={i}
              cx={(Math.sin(i * 137.5) * 0.5 + 0.5) * 500}
              cy={(Math.cos(i * 97.3) * 0.5 + 0.5) * 500}
              r={Math.random() < 0.3 ? 1.5 : 0.8}
              fill="rgba(255,255,255,0.2)"
            />
          ))}

          {/* Orbit rings */}
          {okrs.map((_, i) => {
            const r = baseRadius + i * radiiStep
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Center circle — execution score */}
          <circle cx={cx} cy={cy} r={36} fill="none" stroke="#22d3ee" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={30} fill="rgba(34,211,238,0.1)" />
          <text x={cx} y={cy - 5} textAnchor="middle" fill="#22d3ee" fontSize={18} fontWeight="bold">
            {totalPoints}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize={9}>
            PTS
          </text>

          {/* OKR nodes on orbits */}
          {okrs.map((okr, i) => {
            const r = baseRadius + i * radiiStep
            const angle = (i / okrs.length) * 2 * Math.PI - Math.PI / 2
            const nx = cx + r * Math.cos(angle)
            const ny = cy + r * Math.sin(angle)
            const okrTasks = tasks.filter((t) => t.okrId === okr.id)

            return (
              <g key={okr.id}>
                {/* OKR node */}
                <circle cx={nx} cy={ny} r={10} fill="#7c3aed" opacity={0.9} />
                <text
                  x={nx}
                  y={ny + 20}
                  textAnchor="middle"
                  fill="#a78bfa"
                  fontSize={8}
                >
                  {okr.objective.slice(0, 16)}
                </text>

                {/* Task satellites around this OKR */}
                {okrTasks.slice(0, 6).map((task, j) => {
                  const taskAngle = angle + (j / Math.max(okrTasks.length, 1)) * Math.PI * 0.6 - Math.PI * 0.3
                  const tr = r + 28
                  const tx = cx + tr * Math.cos(taskAngle)
                  const ty = cy + tr * Math.sin(taskAngle)
                  return (
                    <circle
                      key={task.id}
                      cx={tx}
                      cy={ty}
                      r={5}
                      fill={STATUS_COLORS[task.status]}
                      opacity={0.8}
                    />
                  )
                })}
              </g>
            )
          })}

          {/* Unlinked tasks cloud near center */}
          {tasks.filter((t) => !t.okrId).slice(0, 8).map((task, i) => {
            const angle = (i / 8) * 2 * Math.PI
            const r = 50 + (i % 3) * 10
            const tx = cx + r * Math.cos(angle)
            const ty = cy + r * Math.sin(angle)
            return (
              <circle
                key={task.id}
                cx={tx}
                cy={ty}
                r={4}
                fill={STATUS_COLORS[task.status]}
                opacity={0.5}
              />
            )
          })}
        </svg>

        {/* Animated orbiting dot overlay (framer-motion) */}
        {okrs.slice(0, 3).map((okr, i) => {
          const r = baseRadius + i * radiiStep
          return (
            <motion.div
              key={okr.id}
              className="absolute rounded-full bg-cyan-400/30"
              style={{
                width: 8,
                height: 8,
                top: `calc(50% - 4px)`,
                left: `calc(50% + ${r}px - 4px)`,
                transformOrigin: `-${r}px 4px`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18 + i * 8, repeat: Infinity, ease: 'linear' }}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-500">
        {Object.keys(STATUS_DOT).map((status) => (
          <span key={status} className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
            {status}
          </span>
        ))}
      </div>
    </div>
  )
}
