import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, Plus } from 'lucide-react'
import { useBalanceStore } from './balanceStore'

type UserStatus = 'focus' | 'break' | 'call' | 'idle'
const STATUS_ICONS: Record<UserStatus, string> = { focus: '🎯', break: '☕', call: '📞', idle: '💤' }

interface ThinkSession { id: string; name: string; duration: number; participants: number }
interface ThinkResult { summary: string; decisions: string[]; tasks: string[]; ideas: string[] }

const MOCK_SESSIONS: ThinkSession[] = [
  { id: 's1', name: 'Focus Morning', duration: 25, participants: 2 },
  { id: 's2', name: 'Brainstorm', duration: 60, participants: 2 },
]

function parseThinkNotes(text: string): ThinkResult {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const decisions = lines.filter((l) =>
    /decidió|acordó|definimos|definió|resolvimos/i.test(l),
  )
  const ideas = lines.filter((l) =>
    /^idea|^💡|idea clave/i.test(l),
  )
  const tasks = lines.filter((l) =>
    /^-\s|^\*\s|^\d+\.\s/.test(l) || (/:\s/.test(l) && l.length < 100),
  )
  const summary = lines.slice(0, 3).join(' ').slice(0, 160) + (lines.length > 3 ? '...' : '')
  return { summary, decisions, tasks, ideas }
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function ThinkView() {
  const { addTask } = useBalanceStore()

  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<ThinkResult | null>(null)
  const [status, setStatus] = useState<UserStatus>('idle')
  const [currentTask, setCurrentTask] = useState('')
  const [activeSession, setActiveSession] = useState<string | null>('s1')

  // Timer
  const [duration, setDuration] = useState(25 * 60)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeLeft === 0) setRunning(false)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, timeLeft])

  function setPreset(mins: number) {
    setDuration(mins * 60)
    setTimeLeft(mins * 60)
    setRunning(false)
  }

  function handleReset() {
    setTimeLeft(duration)
    setRunning(false)
  }

  function handleGenerate() {
    if (!notes.trim()) return
    setResult(parseThinkNotes(notes))
  }

  function convertTasksToBalance() {
    if (!result) return
    result.tasks.forEach((t) => {
      addTask({
        title: t.replace(/^[-*\d.]\s*/, '').split(':').pop()?.trim() ?? t,
        priority: 'medium',
        category: 'work',
        status: 'todo',
      })
    })
  }

  const mm = Math.floor(timeLeft / 60)
  const ss = timeLeft % 60

  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <div>
        <h2 className="text-base font-bold text-cyan-400">🧠 THINK — Beyond Meethink</h2>
        <p className="text-xs text-slate-500">Reuniones inteligentes · decisiones automáticas · generación de ideas</p>
      </div>

      <p className="text-sm font-semibold text-slate-300">Las reuniones no son para hablar. Son para pensar juntos.</p>
      <p className="text-xs text-slate-500">THINK resume discusiones, detecta ideas clave, crea planes de acción y genera mapas mentales.</p>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Notes + Result */}
        <div className="space-y-3">
          <div className="rounded-xl border border-white/[0.08] bg-slate-800/40 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">Acta o notas de reunión</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              placeholder={`Ejemplo:\nSe decidió lanzar el producto en junio.\nAna: diseño UI\nCarlos: arquitectura backend\nIdea clave: integrar IA para análisis de reuniones.`}
              className="w-full resize-none rounded-lg bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!notes.trim()}
            className="w-full rounded-xl bg-slate-700 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-600 disabled:opacity-40"
          >
            Generar Think Engine
          </button>

          {result && (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-3">
              <p className="text-xs font-bold text-cyan-400">Resultado automático</p>
              {result.summary && (
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Resumen</p>
                  <p className="text-xs text-slate-300 mt-1">{result.summary}</p>
                </div>
              )}
              {result.decisions.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Decisiones ({result.decisions.length})</p>
                  {result.decisions.map((d, i) => <p key={i} className="text-xs text-amber-300 mt-0.5">• {d}</p>)}
                </div>
              )}
              {result.ideas.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Ideas clave ({result.ideas.length})</p>
                  {result.ideas.map((d, i) => <p key={i} className="text-xs text-violet-300 mt-0.5">💡 {d}</p>)}
                </div>
              )}
              {result.tasks.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Tareas detectadas ({result.tasks.length})</p>
                  {result.tasks.map((t, i) => <p key={i} className="text-xs text-emerald-300 mt-0.5">→ {t}</p>)}
                  <button
                    type="button"
                    onClick={convertTasksToBalance}
                    className="mt-2 w-full rounded-lg bg-emerald-500/20 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30"
                  >
                    Añadir a Kanban
                  </button>
                </div>
              )}
              {result.summary === '' && result.decisions.length === 0 && result.tasks.length === 0 && (
                <p className="text-xs text-slate-500">No se detectaron patrones. Prueba con texto más estructurado.</p>
              )}
            </div>
          )}
          {!result && (
            <div className="rounded-xl border border-white/[0.07] bg-slate-800/20 p-4">
              <p className="text-xs text-slate-500">Cierra una reunión y ejecuta THINK para ver resumen, decisiones y tareas.</p>
            </div>
          )}
        </div>

        {/* Right: Status + Timer + Sessions */}
        <div className="space-y-3">
          {/* Tu Estado */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
            <p className="mb-2 text-xs font-semibold text-cyan-400">Tu Estado</p>
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-slate-900/60 p-3">
              <span className="text-2xl">{STATUS_ICONS[status]}</span>
              <div>
                <p className="text-xs font-semibold text-slate-200">Tú</p>
                <p className="text-[10px] text-slate-500">{status}</p>
              </div>
            </div>
            <p className="mb-1 text-[10px] text-slate-500">Status</p>
            <div className="mb-3 flex gap-1.5">
              {(Object.keys(STATUS_ICONS) as UserStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  title={s}
                  aria-label={s}
                  className={`rounded-lg p-2 text-base transition ${status === s ? 'bg-slate-700' : 'hover:bg-slate-800'}`}
                >
                  {STATUS_ICONS[s]}
                </button>
              ))}
            </div>
            <p className="mb-1 text-[10px] text-slate-500">Tarea Actual</p>
            <input
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="¿En qué trabajas?"
              aria-label="Tarea actual"
              className="w-full rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Timer */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              ⏱️ Timer Compartido
            </p>
            <div className="mb-3 flex items-center justify-center">
              <span className={`font-mono text-5xl font-bold tabular-nums ${running ? 'text-cyan-400' : 'text-slate-200'}`}>
                {pad(mm)} : {pad(ss)}
              </span>
            </div>
            <p className="mb-3 text-center text-[10px] text-slate-500">/ {Math.floor(duration / 60)} min</p>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setRunning((v) => !v)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${running ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
              >
                {running ? '⏸ Pausar' : <><Play size={12} /> Iniciar</>}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-700"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
            <div className="flex gap-2">
              {[25, 5, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setPreset(mins)}
                  className={`flex-1 rounded-xl border py-1.5 text-xs transition ${duration === mins * 60 ? 'border-cyan-500/40 text-cyan-400' : 'border-white/[0.08] text-slate-500 hover:border-slate-600'}`}
                >
                  {mins === 25 ? '🍅' : mins === 5 ? '☕' : '🌅'} {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Sessions */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-red-400">📌 Sesiones Activas</p>
              <button type="button" title="Nueva sesión" aria-label="Nueva sesión" className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-cyan-400">
                <Plus size={13} />
              </button>
            </div>
            {MOCK_SESSIONS.map((s) => (
              <div key={s.id} className={`mb-2 flex items-center justify-between rounded-xl p-2.5 ${activeSession === s.id ? 'bg-slate-700/60' : 'bg-slate-800/30'}`}>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{s.name}</p>
                  <p className="text-[10px] text-slate-500">🍅 {s.duration} min · 👥 {s.participants}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSession(activeSession === s.id ? null : s.id)}
                  className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${activeSession === s.id ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}
                >
                  {activeSession === s.id ? 'Salir' : 'Unirse'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
