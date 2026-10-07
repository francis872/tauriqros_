import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Terminal, FolderOpen, Zap, Settings, Activity, BookOpen } from 'lucide-react'
import { useDesktopStore } from '../store/desktopStore'
import { APP_REGISTRY } from '../apps/registry'

const ICON_MAP: Record<string, React.ElementType> = {
  files: FolderOpen,
  terminal: Terminal,
  notes: BookOpen,
  ai: Zap,
  settings: Settings,
  monitor: Activity,
  'ascii-search': Search,
}

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const store = useDesktopStore()

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const appResults = Object.values(APP_REGISTRY).filter(app =>
    !query
    || app.label.toLowerCase().includes(query.toLowerCase())
    || app.description.toLowerCase().includes(query.toLowerCase())
    || app.route.toLowerCase().includes(query.toLowerCase())
  )

  const handleOpenApp = (appId: string) => {
    const app = APP_REGISTRY[appId]
    store.openApp(appId, app.label, app.defaultWidth, app.defaultHeight)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[560px] z-50 rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)] border border-white/[0.1]"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0d0d14]/95 backdrop-blur-2xl">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
                <Search size={16} className="text-slate-500 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search apps, commands, files..."
                  className="flex-1 bg-transparent text-base text-slate-200 outline-none placeholder:text-slate-600"
                />
                <kbd className="text-[10px] font-mono text-slate-700 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.06]">ESC</kbd>
              </div>

              {/* Results */}
              <div className="p-2 max-h-80 overflow-y-auto">
                {!query && (
                  <p className="text-[10px] font-mono text-slate-700 px-3 py-1.5 tracking-widest">APPLICATIONS</p>
                )}
                {appResults.map((app, i) => {
                  const Icon = ICON_MAP[app.id] ?? Search
                  return (
                    <motion.button
                      key={app.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleOpenApp(app.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.05] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-sky-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">{app.label}</p>
                        <p className="text-[10px] text-slate-600">{app.description}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">ruta: {app.route}</p>
                      </div>
                      <kbd className="text-[9px] font-mono text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        ↵ open
                      </kbd>
                    </motion.button>
                  )
                })}

                {query && appResults.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-700 font-mono">
                    no results for "{query}"
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-4">
                <span className="text-[9px] font-mono text-slate-700">↑↓ navigate · ↵ select · ESC close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
