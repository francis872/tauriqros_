import { useBalanceStore, type TaskCategory } from './balanceStore'

type Level = 'experto' | 'intermedio' | 'novato'

interface Skill {
  category: TaskCategory
  level: Level
  count: number
}

const LEVEL_COLORS: Record<Level, string> = {
  experto: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  intermedio: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  novato: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const LEVEL_LABELS: Record<Level, string> = {
  experto: 'EXPERTO',
  intermedio: 'INTERMEDIO',
  novato: 'NOVATO',
}

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  personal: 'Personal',
  work: 'Trabajo',
  health: 'Salud',
  learning: 'Aprendizaje',
  finance: 'Finanzas',
}

function getLevel(count: number): Level {
  if (count >= 6) return 'experto'
  if (count >= 3) return 'intermedio'
  return 'novato'
}

export default function SkillsView() {
  const tasks = useBalanceStore((s) => s.tasks)
  const completed = tasks.filter((t) => t.status === 'done')

  const skillMap = new Map<TaskCategory, number>()
  for (const t of completed) {
    skillMap.set(t.category, (skillMap.get(t.category) ?? 0) + 1)
  }

  const skills: Skill[] = Array.from(skillMap.entries()).map(([category, count]) => ({
    category,
    level: getLevel(count),
    count,
  }))

  const total = skills.length
  const expert = skills.filter((s) => s.level === 'experto').length
  const intermediate = skills.filter((s) => s.level === 'intermedio').length
  const novice = skills.filter((s) => s.level === 'novato').length

  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <div className="flex items-center gap-2">
        <span className="text-base">🏆</span>
        <h2 className="text-sm font-bold text-cyan-400">Portfolio de Competencias</h2>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {(
          [
            { label: 'TOTAL', value: total, color: 'text-cyan-400' },
            { label: 'EXPERTO', value: expert, color: 'text-amber-400' },
            { label: 'INTERMEDIO', value: intermediate, color: 'text-slate-300' },
            { label: 'NOVATO', value: novice, color: 'text-emerald-400' },
          ] as const
        ).map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-slate-800/40 py-4"
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {skills.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-500 text-sm">Completa tareas para construir tu portfolio de competencias.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {skills.map((skill) => (
            <div
              key={skill.category}
              className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-slate-200">{CATEGORY_LABELS[skill.category]}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${LEVEL_COLORS[skill.level]}`}>
                  {LEVEL_LABELS[skill.level]}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{skill.count} tarea(s) completada(s)</p>
              <div className="mt-2 h-1 rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${Math.min(100, (skill.count / 10) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
