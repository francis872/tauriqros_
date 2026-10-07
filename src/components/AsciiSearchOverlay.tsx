import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useDesktopStore } from '../store/desktopStore'
import { runAsciiSearch } from '../search/asciiSearchRuntime'
import { createExplicitFileIndex, type IndexedFileRecord } from '../indexing/fileIndexingService'
import { readDirectoryRecursive } from '../filesystem/filesystemService'
import { DARE_WORKSPACE_PATH } from '../apps/dareWorkspace'

interface AsciiSearchOverlayProps {
  open: boolean
  onClose: () => void
}

export default function AsciiSearchOverlay({ open, onClose }: AsciiSearchOverlayProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dareFiles, setDareFiles] = useState<IndexedFileRecord[]>([])
  const [dareIndexing, setDareIndexing] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const store = useDesktopStore()

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

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
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, Math.max(snapshot.results.length - 1, 0)))
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      }

      if (e.key === 'Enter' && selected) {
        const result = snapshot.results[selectedIndex]
        if (result.type === 'app') {
          store.openApp(result.id, result.label, 720, 520)
        } else if (result.type === 'file' && result.filePath) {
          const directoryPath = result.category === 'DARE folder'
            ? result.filePath
            : result.filePath.replace(/\/[^/]+$/, '') || '/'
          store.openApp('files', 'Files', 780, 520, directoryPath)
        }
        onClose()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, selected, selectedIndex, snapshot.results, store])

  const renderSelected = selected ? (
    <div className="mt-3 rounded-xl border border-slate-700/80 bg-slate-950/60 p-3 text-[11px] text-slate-200">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-slate-100">Seleccionado:</span>
        <span className="text-slate-500">{selectedIndex + 1}/{snapshot.results.length}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-cyan-300">{selected.label}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-[0.18em]">{selected.category}</p>
      <p className="mt-1 text-[10px] text-slate-400">{selected.description}</p>
      <p className="mt-2 text-[10px] text-slate-500">ruta: {selected.route}</p>
    </div>
  ) : null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[14%] left-1/2 -translate-x-1/2 w-[700px] z-50 rounded-2xl border border-white/[0.1] bg-[#01040d] shadow-[0_32px_120px_rgba(0,0,0,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center gap-3 border-b border-white/[0.08] pb-3 mb-4">
                <Search size={18} className="text-slate-300" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Escribe aquí tu búsqueda ASCII..."
                  className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-600 text-sm font-mono"
                />
              </div>

              <pre className="whitespace-pre-wrap break-words rounded-xl border border-white/[0.08] bg-black/90 p-4 text-[11px] leading-5 text-slate-200 font-mono min-h-[260px]">
                {snapshot.asciiFrame}
              </pre>

              {renderSelected}

              <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>↑↓ mover · ↵ abrir · ESC cerrar</span>
                <span>{snapshot.results.length} resultados · {dareIndexing ? 'indexando DARE...' : `${dareFiles.length} archivos DARE`}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
