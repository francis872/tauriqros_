import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useBalanceStore } from './balanceStore'

export default function OKRsView() {
  const { okrs, tasks, addOKR, deleteOKR } = useBalanceStore()
  const [objective, setObjective] = useState('')
  const [keyResults, setKeyResults] = useState('')

  function handleAdd() {
    if (!objective.trim()) return
    const krs = keyResults.split(',').map((s) => s.trim()).filter(Boolean)
    addOKR(objective.trim(), krs)
    setObjective('')
    setKeyResults('')
  }

  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <h2 className="text-sm font-bold text-slate-200">OKRs</h2>

      <div className="flex items-center gap-2">
        <input
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Objective title"
          className="flex-1 rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          value={keyResults}
          onChange={(e) => setKeyResults(e.target.value)}
          placeholder="Key Results (comma separated)"
          className="flex-1 rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!objective.trim()}
          className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40"
        >
          Add OKR
        </button>
      </div>

      {okrs.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No OKRs yet</p>
      ) : (
        <div className="space-y-3">
          {okrs.map((okr) => {
            const linked = tasks.filter((t) => t.okrId === okr.id)
            const done = linked.filter((t) => t.status === 'done').length
            const pct = linked.length ? Math.round((done / linked.length) * 100) : 0
            return (
              <div key={okr.id} className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-100">{okr.objective}</p>
                    {okr.keyResults.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {okr.keyResults.map((kr, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                            {kr}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-violet-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">{pct}% · {done}/{linked.length} tareas</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteOKR(okr.id)}
                    aria-label="Eliminar OKR"
                    title="Eliminar OKR"
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
