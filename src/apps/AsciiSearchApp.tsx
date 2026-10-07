import type { KeyboardEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useDesktopStore } from '../store/desktopStore'
import { runAsciiSearch } from '../search/asciiSearchRuntime'
import { createExplicitFileIndex, type IndexedFileRecord } from '../indexing/fileIndexingService'
import { readDirectoryRecursive } from '../filesystem/filesystemService'
import { DARE_WORKSPACE_PATH } from './dareWorkspace'

interface AsciiSearchAppProps {
  windowId: string
}

export default function AsciiSearchApp({ windowId }: AsciiSearchAppProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dareFiles, setDareFiles] = useState<IndexedFileRecord[]>([])
  const [dareIndexing, setDareIndexing] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const store = useDesktopStore()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    let mounted = true
    readDirectoryRecursive(DARE_WORKSPACE_PATH, { maxDepth: 7, maxEntries: 1200 })
      .then((entries) => {
        if (!mounted) return
        setDareFiles(createExplicitFileIndex(entries).records)
      })
      .catch(() => {
        if (!mounted) return
        setDareFiles([])
      })
      .finally(() => {
        if (!mounted) return
        setDareIndexing(false)
      })

    return () => { mounted = false }
  }, [])

  const snapshot = useMemo(() => runAsciiSearch(query, dareFiles), [query, dareFiles])
  const selected = snapshot.results[selectedIndex] ?? null

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const openSelection = (item: typeof selected) => {
    if (!item) return

    if (item.type === 'app') {
      store.openApp(item.id, item.label, 720, 520)
      return
    }

    if (item.type === 'file' && item.filePath) {
      const directoryPath = item.category === 'DARE folder'
        ? item.filePath
        : item.filePath.replace(/\/[^/]+$/, '') || '/'
      store.openApp('files', 'Files', 780, 520, directoryPath)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(snapshot.results.length - 1, 0)))
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    }

    if (event.key === 'Enter' && selected) {
      openSelection(selected)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#06090f] text-slate-200">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
        <Search size={16} className="text-sky-400" />
        <div>
          <p className="text-sm font-semibold">ASCII Search</p>
          <p className="text-[10px] text-slate-500">Busca aplicaciones TAURIQ con estilo retro y resultados inteligentes.</p>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 overflow-hidden">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe para buscar..."
          className="w-full rounded-xl border border-white/[0.08] bg-[#0e1118] px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400"
        />

        <div className="grid gap-3 lg:grid-cols-[1fr_320px] h-full overflow-hidden">
          <div className="overflow-auto rounded-2xl border border-white/[0.06] bg-black/70 p-4 text-[11px] font-mono leading-5 text-slate-200">
            <pre className="whitespace-pre-wrap">{snapshot.asciiFrame}</pre>
          </div>

          <div className="overflow-auto rounded-2xl border border-white/[0.06] bg-[#07111f]/90 p-4 text-sm text-slate-200">
            <div className="mb-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">@ búsqueda</p>
              <p className="mt-2 text-[13px] text-slate-100">{query ? `Coincidencias de: ${query}` : 'Sugerencias rápidas basadas en tus apps'}</p>
            </div>
            {snapshot.results.map((item, index) => (
              <button
                key={item.id}
                onClick={() => openSelection(item)}
                className={`mb-2 w-full rounded-2xl border px-3 py-3 text-left transition-colors ${
                  index === selectedIndex ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/[0.06] bg-transparent hover:border-slate-400/40 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-100">{item.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{item.category}</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">{item.description}</p>
                <p className="mt-2 text-[10px] text-cyan-300">ruta: {item.route}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>↑↓ mover · ↵ abrir · ESC cerrar</span>
          <span>
            ventana {windowId} · {snapshot.results.length} resultados · {dareIndexing ? 'indexando DARE...' : `${dareFiles.length} archivos DARE`}
          </span>
        </div>
      </div>
    </div>
  )
}
