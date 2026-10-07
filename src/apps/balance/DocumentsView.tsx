import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useDocsStore } from './docsStore'

const TOOLBAR_BTNS = [
  { cmd: 'bold', label: 'B', title: 'Negrita', style: 'font-bold' },
  { cmd: 'italic', label: 'I', title: 'Cursiva', style: 'italic' },
  { cmd: 'underline', label: 'U', title: 'Subrayado', style: 'underline' },
  { cmd: 'strikeThrough', label: 'S', title: 'Tachado', style: 'line-through' },
]

function execCmd(cmd: string, val?: string) {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  document.execCommand(cmd, false, val ?? '')
}

function formatTime(ms: number) {
  const d = new Date(ms)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface EditorPanelProps {
  content: string
  onSave: (html: string) => void
}

function EditorPanel({ content, onSave }: EditorPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [empty, setEmpty] = useState(!content)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = content
    setEmpty(!content)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleInput() {
    const html = ref.current?.innerHTML ?? ''
    setEmpty(!ref.current?.textContent?.trim())
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      onSave(html)
      setSaved(true)
    }, 800)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-white/[0.06] bg-slate-900/80 p-2">
        {TOOLBAR_BTNS.map((btn) => (
          <button
            key={btn.cmd}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd(btn.cmd) }}
            title={btn.title}
            aria-label={btn.title}
            className={`rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 ${btn.style}`}
          >
            {btn.label}
          </button>
        ))}
        <div className="mx-1 h-3.5 w-px bg-white/10" />
        <select
          aria-label="Estilo"
          title="Estilo de párrafo"
          defaultValue=""
          onChange={(e) => { execCmd('formatBlock', e.target.value); e.target.value = '' }}
          className="rounded border border-white/[0.08] bg-slate-800 px-1.5 py-1 text-xs text-slate-300 focus:outline-none"
        >
          <option value="" disabled>Aa</option>
          <option value="p">Párrafo</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList') }} title="Lista" aria-label="Lista" className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">• Lista</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList') }} title="Lista num." aria-label="Lista numerada" className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">1. Nº</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', 'blockquote') }} title="Cita" aria-label="Cita" className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">&quot; Cita</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', 'pre') }} title="Código" aria-label="Código" className="rounded px-2 py-1 font-mono text-xs text-slate-300 hover:bg-slate-700">&lt;/&gt; TXT</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('justifyLeft') }} title="Izquierda" aria-label="Alinear izquierda" className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">←</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('justifyCenter') }} title="Centro" aria-label="Centrar" className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">—</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('justifyRight') }} title="Derecha" aria-label="Alinear derecha" className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">→</button>
        <span className={`ml-auto text-[10px] ${saved ? 'text-slate-600' : 'text-cyan-500'}`}>
          {saved ? 'Auto-guardado' : 'Guardando...'}
        </span>
      </div>

      {/* Editable area */}
      <div className="relative flex-1 overflow-y-auto">
        {empty && (
          <p className="pointer-events-none absolute left-4 top-4 text-sm text-slate-600">
            Escribe aquí...
          </p>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="h-full min-h-[200px] p-4 text-sm text-slate-200 focus:outline-none [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-500/60 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-400 [&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs"
        />
      </div>
    </div>
  )
}

export default function DocumentsView() {
  const { docs, createDoc, deleteDoc, updateSheet, addSheet, deleteSheet } = useDocsStore()
  const [activeDocId, setActiveDocId] = useState<string>(docs[0]?.id ?? '')
  const [activeSheetId, setActiveSheetId] = useState<string>(docs[0]?.sheets[0]?.id ?? '')

  const activeDoc = docs.find((d) => d.id === activeDocId)
  const activeSheet = activeDoc?.sheets.find((s) => s.id === activeSheetId)

  function handleNewDoc() {
    const id = createDoc()
    setActiveDocId(id)
    // Fallback: select after store updates
    setTimeout(() => {
      const doc = useDocsStore.getState().docs.find((d) => d.id === id)
      if (doc) setActiveSheetId(doc.sheets[0].id)
    }, 10)
  }

  function selectDoc(docId: string) {
    setActiveDocId(docId)
    const doc = docs.find((d) => d.id === docId)
    if (doc) setActiveSheetId(doc.sheets[0].id)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-44 flex-col border-r border-white/[0.06] bg-slate-900/60 flex-shrink-0">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
          <span className="text-xs font-semibold text-slate-400">📄 Documentos</span>
          <button
            type="button"
            onClick={handleNewDoc}
            title="Nuevo documento"
            aria-label="Nuevo documento"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-cyan-400"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {docs.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => selectDoc(doc.id)}
              className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition ${
                activeDocId === doc.id ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <p className="truncate font-medium">{doc.title}</p>
              <p className="mt-0.5 text-[10px] opacity-60">{new Date(doc.updatedAt).toLocaleDateString('es-ES')}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* Main editor */}
      {activeDoc && activeSheet ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Doc header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
            <p className="text-sm font-semibold text-slate-200">{activeDoc.title}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">
                {formatTime(activeDoc.updatedAt)} · Auto-guardado
              </span>
              {activeDoc.id !== 'welcome' && (
                <button
                  type="button"
                  onClick={() => { deleteDoc(activeDoc.id); selectDoc(docs[0]?.id ?? '') }}
                  title="Eliminar documento"
                  aria-label="Eliminar documento"
                  className="rounded-lg p-1 text-slate-600 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Sheet tabs */}
          <div className="flex items-center gap-1 border-b border-white/[0.06] bg-slate-900/60 px-3 py-1.5">
            {activeDoc.sheets.map((sheet) => (
              <button
                key={sheet.id}
                type="button"
                onClick={() => setActiveSheetId(sheet.id)}
                className={`flex items-center gap-1.5 rounded-t-lg px-3 py-1 text-xs transition ${
                  activeSheetId === sheet.id ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {sheet.name}
                {activeDoc.sheets.length > 1 && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Eliminar ${sheet.name}`}
                    onKeyDown={(e) => e.key === 'Enter' && deleteSheet(activeDoc.id, sheet.id)}
                    onClick={(e) => { e.stopPropagation(); deleteSheet(activeDoc.id, sheet.id); setActiveSheetId(activeDoc.sheets.find((s) => s.id !== sheet.id)?.id ?? '') }}
                    className="ml-1 text-slate-600 hover:text-red-400 cursor-pointer"
                  >×</span>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { addSheet(activeDoc.id); setTimeout(() => { const d = useDocsStore.getState().docs.find((dd) => dd.id === activeDoc.id); if (d) setActiveSheetId(d.sheets[d.sheets.length - 1].id) }, 10) }}
              title="Añadir hoja"
              aria-label="Añadir hoja"
              className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-800 hover:text-cyan-400"
            >
              + Hoja
            </button>
          </div>

          <EditorPanel
            key={`${activeDoc.id}-${activeSheet.id}`}
            content={activeSheet.content}
            onSave={(html) => updateSheet(activeDoc.id, activeSheet.id, html)}
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-slate-500 text-sm">
          Selecciona o crea un documento
        </div>
      )}
    </div>
  )
}
