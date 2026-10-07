import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Eye, FileText, Image, BarChart2, Check } from 'lucide-react'

interface VisionTask {
  id: string
  name: string
  type: 'document' | 'image' | 'dashboard'
  status: 'queued' | 'processing' | 'done' | 'error'
  result: string
  createdAt: number
}

const MOCK_TASKS: VisionTask[] = [
  { id: '1', name: 'Q2_Financial_Report.pdf', type: 'document', status: 'done', result: 'Extraídos 47 KPIs financieros. Revenue: $2.4M (+18% QoQ). EBITDA: 32%. 3 anomalías detectadas en gastos de marketing.', createdAt: Date.now() - 3600000 },
  { id: '2', name: 'product_screenshot_v3.png', type: 'image', status: 'done', result: 'UI screenshot analizado. Se detectaron 4 elementos de UI, flujo de onboarding de 3 pasos, CTA principal identificado.', createdAt: Date.now() - 7200000 },
  { id: '3', name: 'Sales_Dashboard_Jun.pdf', type: 'dashboard', status: 'processing', result: '', createdAt: Date.now() - 600000 },
  { id: '4', name: 'Contract_NDA_2026.pdf', type: 'document', status: 'done', result: 'Contrato de confidencialidad 4 páginas. Cláusulas clave: término 2 años, jurisdicción México, penalización por incumplimiento $50K USD.', createdAt: Date.now() - 86400000 },
]

const TYPE_ICON: Record<string, React.ReactNode> = {
  document: <FileText size={14} />,
  image: <Image size={14} />,
  dashboard: <BarChart2 size={14} />,
}

const STATUS_CONFIG = {
  queued:     { label: 'Queued',     color: 'text-zinc-400',   bg: 'bg-zinc-800/60 border-zinc-700' },
  processing: { label: 'Processing', color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/30' },
  done:       { label: 'Done',       color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/30' },
  error:      { label: 'Error',      color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30' },
}

export default function VisionView() {
  const [tasks, setTasks] = useState<VisionTask[]>(MOCK_TASKS)
  const [selectedId, setSelectedId] = useState<string | null>('1')
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const type: VisionTask['type'] = ['pdf', 'doc', 'docx', 'txt'].includes(ext) ? 'document' : ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? 'image' : 'dashboard'
    const newTask: VisionTask = {
      id: Math.random().toString(36).slice(2),
      name: file.name,
      type,
      status: 'queued',
      result: '',
      createdAt: Date.now(),
    }
    setTasks((prev) => [newTask, ...prev])
    // Simulate processing
    setTimeout(() => {
      setTasks((prev) => prev.map((t) => t.id === newTask.id ? { ...t, status: 'processing' } : t))
      setTimeout(() => {
        setTasks((prev) => prev.map((t) => t.id === newTask.id ? {
          ...t,
          status: 'done',
          result: `Análisis completado de ${file.name}. Contenido procesado con Relay Vision. Datos estructurados extraídos exitosamente.`
        } : t))
      }, 3000)
    }, 1000)
  }

  const selected = tasks.find((t) => t.id === selectedId)

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Left panel */}
      <div className="flex w-64 flex-col border-r border-white/[0.06] flex-shrink-0">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <p className="text-xs font-semibold text-slate-400">Vision Engine</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Document & image intelligence</p>
        </div>

        {/* Drop zone */}
        <div
          className={`mx-3 mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition ${dragging ? 'border-violet-500/60 bg-violet-500/10' : 'border-white/[0.08] hover:border-violet-500/30'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload size={18} className={dragging ? 'text-violet-400' : 'text-slate-600'} />
          <p className="text-[10px] text-slate-600">Drop files to analyze</p>
          <p className="text-[9px] text-slate-700">PDF, DOCX, PNG, JPG</p>
        </div>

        {/* Task list */}
        <div className="border-b border-white/[0.06] px-4 py-2 mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Analysis Queue ({tasks.length})</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {tasks.map((task) => {
              const sc = STATUS_CONFIG[task.status]
              return (
                <motion.button
                  key={task.id}
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedId(task.id === selectedId ? null : task.id)}
                  className={`flex w-full items-center gap-3 border-b border-white/[0.04] px-4 py-3 text-left hover:bg-white/[0.02] transition ${selectedId === task.id ? 'bg-violet-500/10' : ''}`}
                >
                  <span className="text-slate-500 flex-shrink-0">{TYPE_ICON[task.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-200 truncate">{task.name}</p>
                    <span className={`inline-block text-[9px] font-semibold rounded-full px-1.5 py-0.5 border mt-0.5 ${sc.bg} ${sc.color}`}>
                      {task.status === 'processing' && '⟳ '}{sc.label}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Result panel */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {selected ? (
          <div className="flex flex-1 flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-900 text-slate-400">
                  {TYPE_ICON[selected.type]}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{selected.name}</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{selected.type} · processed by Relay Vision</p>
                </div>
              </div>
              <Eye size={18} className="text-slate-600" />
            </div>

            {selected.status === 'done' ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Check size={14} className="text-emerald-400" />
                  <p className="text-xs font-semibold text-emerald-300">Analysis Complete</p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{selected.result}</p>
              </div>
            ) : selected.status === 'processing' ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-violet-500/40 border-t-violet-500 animate-spin" />
                <p className="text-sm text-slate-400">Processing with Vision Engine...</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
                <p className="text-sm text-slate-500">Queued for analysis</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <div className="text-4xl">👁️</div>
            <p className="text-sm text-slate-500">Select a task to view analysis</p>
          </div>
        )}
      </div>
    </div>
  )
}
