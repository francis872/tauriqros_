import { useRef, useState, useEffect } from 'react'
import { Zap } from 'lucide-react'
import { useBalanceStore } from './balanceStore'

const TOOLBAR = [
  { cmd: 'bold', label: 'B', style: 'font-bold' },
  { cmd: 'italic', label: 'I', style: 'italic' },
  { cmd: 'underline', label: 'U', style: 'underline' },
  { cmd: 'strikeThrough', label: 'S', style: 'line-through' },
]

const BLOCK_STYLES = [
  { label: 'Párrafo', cmd: 'formatBlock', val: 'p' },
  { label: 'Título 1', cmd: 'formatBlock', val: 'h1' },
  { label: 'Título 2', cmd: 'formatBlock', val: 'h2' },
  { label: 'Título 3', cmd: 'formatBlock', val: 'h3' },
]

function execCmd(cmd: string, val?: string) {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  document.execCommand(cmd, false, val ?? '')
}

export default function NotesView() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [linkedOKR, setLinkedOKR] = useState('')
  const [extractSubs, setExtractSubs] = useState(true)
  const { okrs, addTask } = useBalanceStore()

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  function handleInput() {
    setIsEmpty(!editorRef.current?.textContent?.trim())
  }

  function handleConvert() {
    const content = editorRef.current?.innerHTML ?? ''
    if (!content.trim()) return

    const plainText = editorRef.current?.textContent ?? ''

    if (extractSubs) {
      // Extract lines that look like tasks (start with -, *, •, or are short sentences)
      const lines = plainText.split('\n').map((l) => l.trim()).filter((l) => l.length > 2 && l.length < 150)
      const taskLines = lines.filter((l) => l.startsWith('-') || l.startsWith('*') || l.startsWith('•'))
      if (taskLines.length > 0) {
        taskLines.forEach((line) => {
          addTask({
            title: line.replace(/^[-*•]\s*/, '').trim(),
            priority: 'medium',
            category: 'work',
            status: 'todo',
            okrId: linkedOKR || undefined,
          })
        })
        return
      }
    }

    // Convert whole note as a single task
    addTask({
      title: plainText.trim().slice(0, 120),
      priority: 'medium',
      category: 'work',
      status: 'todo',
      okrId: linkedOKR || undefined,
    })
  }

  function handleClear() {
    if (editorRef.current) {
      editorRef.current.innerHTML = ''
      setIsEmpty(true)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      <div className="mb-4 text-center">
        <h2 className="text-base font-bold text-cyan-400">📝 Suite de Desarrollo de Proyectos</h2>
        <p className="text-xs text-slate-500">Editor de Documentos + Knowledge Engine</p>
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] bg-slate-800/60 p-2">
        {TOOLBAR.map((btn) => (
          <button
            key={btn.cmd}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd(btn.cmd) }}
            title={btn.label}
            aria-label={btn.label}
            className={`rounded-lg px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 ${btn.style}`}
          >
            {btn.label}
          </button>
        ))}
        <div className="mx-1 h-4 w-px bg-white/10" />
        <select
          aria-label="Estilo de bloque"
          title="Estilo de bloque"
          onChange={(e) => { execCmd('formatBlock', e.target.value); e.target.value = '' }}
          defaultValue=""
          className="rounded-lg border border-white/[0.08] bg-slate-800 px-2 py-1 text-xs text-slate-300 focus:outline-none"
        >
          <option value="" disabled>Estilo</option>
          {BLOCK_STYLES.map((s) => <option key={s.val} value={s.val}>{s.label}</option>)}
        </select>
        <div className="mx-1 h-4 w-px bg-white/10" />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList') }}
          title="Lista"
          aria-label="Lista"
          className="rounded-lg px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
        >• Lista</button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList') }}
          title="Lista numerada"
          aria-label="Lista numerada"
          className="rounded-lg px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
        >1. Nº</button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', 'blockquote') }}
          title="Cita"
          aria-label="Cita"
          className="rounded-lg px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
        >&quot; Cita</button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', 'pre') }}
          title="Código"
          aria-label="Código"
          className="rounded-lg px-2.5 py-1 font-mono text-xs text-slate-300 hover:bg-slate-700"
        >&lt;&gt; Código</button>
        <button
          type="button"
          onClick={handleClear}
          title="Limpiar"
          aria-label="Limpiar"
          className="rounded-lg px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10"
        >✕ Limpiar</button>
      </div>

      {/* OKR + convert row */}
      <div className="mb-3 flex items-center gap-3">
        <label className="text-xs text-slate-400">Vincular OKR:</label>
        <select
          value={linkedOKR}
          onChange={(e) => setLinkedOKR(e.target.value)}
          aria-label="Vincular OKR"
          title="Vincular OKR"
          className="rounded-lg border border-white/[0.08] bg-slate-800 px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="">— Sin vincular —</option>
          {okrs.map((o) => <option key={o.id} value={o.id}>{o.objective.slice(0, 30)}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={extractSubs}
            onChange={(e) => setExtractSubs(e.target.checked)}
            className="accent-cyan-500"
          />
          Extraer subtareas
        </label>
        <button
          type="button"
          onClick={handleConvert}
          disabled={isEmpty}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-cyan-500/20 px-4 py-2 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/30 disabled:opacity-40"
        >
          <Zap size={12} />
          Convertir en tarea
        </button>
      </div>

      {/* Editor */}
      <div className="relative flex-1 rounded-xl border border-white/[0.08] bg-slate-800/30 overflow-hidden">
        {isEmpty && (
          <p className="pointer-events-none absolute left-4 top-4 text-sm text-slate-600">
            Escribe aquí tu idea...
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="h-full w-full overflow-y-auto p-4 text-sm text-slate-200 focus:outline-none [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-medium [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_pre]:rounded [&_pre]:bg-slate-900 [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs"
        />
      </div>
    </div>
  )
}
