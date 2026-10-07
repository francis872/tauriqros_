import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, ChevronRight, File, Folder, Home, HardDrive, ArrowLeft, Search } from 'lucide-react'
import { detectMountedDrives, readDirectory, readDirectoryRecursive, type FilesystemEntry } from '../filesystem/filesystemService'
import { createExplicitFileIndex, createFileIndex, intelligentSearch, type IndexedFileRecord } from '../indexing/fileIndexingService'
import { detectProjects } from '../indexing/projectIndexer'
import { buildFilesystemSuggestions } from '../filesystem/filesystemIntelligenceRuntime'
import { DARE_WORKSPACE_PATH } from './dareWorkspace'

export default function FilesApp({ initialPath }: { windowId: string; initialPath?: string }) {
  const [path, setPath] = useState(initialPath ?? '/')
  const [history, setHistory] = useState<string[]>([])
  const [entries, setEntries] = useState<FilesystemEntry[]>([])
  const [query, setQuery] = useState('')
  const [mountedDrives, setMountedDrives] = useState<string[]>(['/'])
  const [source, setSource] = useState<'native' | 'fallback'>('fallback')
  const [dareRecords, setDareRecords] = useState<IndexedFileRecord[]>([])
  useEffect(() => {
    if (initialPath) {
      setPath(initialPath)
      setHistory([])
    }
  }, [initialPath])
  const [dareIndexing, setDareIndexing] = useState(true)
  useEffect(() => {
    detectMountedDrives().then((drives) => {
      setMountedDrives(drives)
    })
  }, [])

  useEffect(() => {
    let mounted = true

    readDirectory(path).then((snapshot) => {
      if (!mounted) {
        return
      }
      setEntries(snapshot.entries)
      setSource(snapshot.source)
    })

    return () => {
      mounted = false
    }
  }, [path])

  useEffect(() => {
    let mounted = true

    readDirectoryRecursive(DARE_WORKSPACE_PATH, { maxDepth: 7, maxEntries: 1200 })
      .then((entries) => {
        if (!mounted) {
          return
        }
        setDareRecords(createExplicitFileIndex(entries).records)
      })
      .catch(() => {
        if (!mounted) {
          return
        }
        setDareRecords([])
      })
      .finally(() => {
        if (!mounted) {
          return
        }
        setDareIndexing(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const index = useMemo(() => createFileIndex(entries, path), [entries, path])
  const projects = useMemo(() => detectProjects(index.records), [index.records])
  const suggestions = useMemo(() => buildFilesystemSuggestions(index.records), [index.records])
  const filtered = useMemo(() => {
    const currentResults = intelligentSearch(index, query)
    if (!query.trim()) {
      return currentResults
    }

    const dareResults = intelligentSearch({ indexedAt: Date.now(), records: dareRecords }, query)
    const unique = new Map([...currentResults, ...dareResults].map((item) => [item.path, item]))
    return Array.from(unique.values()).slice(0, 20)
  }, [index, query, dareRecords])

  const openSearchResult = (item: IndexedFileRecord) => {
    setHistory((state) => [...state, path])
    if (item.kind === 'directory') {
      setPath(item.path)
      return
    }
    const parentPath = item.path.replace(/\/[^/]+$/, '') || '/'
    setPath(parentPath)
  }

  const goBack = () => {
    const prev = history[history.length - 1]
    if (prev !== undefined) {
      setHistory(h => h.slice(0, -1))
      setPath(prev)
    }
  }

  const segments = path === '/' ? [] : path.split('/').filter(Boolean)

  return (
    <div className="flex h-full text-slate-300">
      {/* Sidebar */}
      <div className="w-44 border-r border-white/[0.06] p-3 flex flex-col gap-1 shrink-0">
        <p className="text-[9px] font-mono text-slate-600 tracking-widest mb-2 px-2">LOCATIONS</p>
        {[
          { icon: Home, label: 'Home', path: '/Home' },
          { icon: FolderOpen, label: 'Projects', path: '/Projects' },
          { icon: Folder, label: 'DARE', path: DARE_WORKSPACE_PATH },
          { icon: HardDrive, label: 'Root', path: '/' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => { setHistory(h => [...h, path]); setPath(item.path) }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
              path === item.path ? 'bg-sky-500/10 text-sky-400' : 'text-slate-500 hover:bg-white/[0.05] hover:text-slate-300'
            }`}
          >
            <item.icon size={12} />
            {item.label}
          </button>
        ))}

        <div className="mt-3 border-t border-white/[0.06] pt-2">
          <p className="px-2 font-mono text-[9px] uppercase tracking-widest text-slate-600">Drives</p>
          {mountedDrives.map((drive) => (
            <button
              key={drive}
              onClick={() => setPath(drive)}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-500 transition-all hover:bg-white/[0.05] hover:text-slate-300"
            >
              <HardDrive size={12} />
              {drive}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-10 border-b border-white/[0.06] flex items-center px-3 gap-2">
          <button
            onClick={goBack}
            disabled={history.length === 0}
            title="Go back"
            className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={13} />
          </button>
          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="text-slate-600">root</span>
            {segments.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight size={10} className="text-slate-700" />
                <span className={i === segments.length - 1 ? 'text-sky-400/70' : 'text-slate-600'}>{seg}</span>
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1">
              <Search size={11} className="text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search files"
                className="w-32 bg-transparent text-[11px] text-slate-300 outline-none placeholder:text-slate-600"
              />
            </div>
            <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-cyan-300/80">
              {source.toUpperCase()}
            </span>
          </div>
        </div>

        {/* File grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {projects.length > 0 && !query && (
            <div className="mb-3 flex flex-wrap gap-2">
              {projects.map((project) => (
                <span
                  key={project.id}
                  className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 font-mono text-[10px] text-cyan-200"
                >
                  {project.name} · {project.type}
                </span>
              ))}
            </div>
          )}

          {suggestions.length > 0 && !query && (
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              {suggestions.map((suggestion) => (
                <div key={suggestion.title} className="rounded-lg border border-cyan-200/15 bg-cyan-400/5 px-2.5 py-2">
                  <p className="text-[11px] text-cyan-100">{suggestion.title}</p>
                  <p className="mt-1 font-mono text-[9px] text-slate-500">{suggestion.rationale}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-4 gap-3">
            {filtered.map((item, i) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onDoubleClick={() => openSearchResult(item)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer hover:bg-white/[0.05] transition-all group select-none"
              >
                {item.kind === 'directory'
                  ? <Folder size={32} className="text-sky-400/60 group-hover:text-sky-400 transition-colors" />
                  : <File size={32} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                }
                <span className="text-[11px] text-slate-400 group-hover:text-slate-200 text-center truncate w-full transition-colors">
                  {item.name}
                </span>
                <span className="text-[9px] text-slate-500 truncate w-full">{item.path}</span>
                {item.size > 0 && <span className="text-[9px] text-slate-700">{Math.round(item.size / 1024)} KB</span>}
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-full text-xs text-slate-700 font-mono">
              {query.trim() ? 'no se encontraron archivos en DARE o este directorio' : 'empty directory'}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="h-6 border-t border-white/[0.06] flex items-center px-3 gap-2">
          <span className="text-[9px] font-mono text-slate-700">
            {filtered.length} indexed items · {dareIndexing ? 'indexando DARE...' : `${dareRecords.length} DARE items cargados`}
          </span>
        </div>
      </div>
    </div>
  )
}
