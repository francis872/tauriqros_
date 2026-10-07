import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import ExecutionProfile from './ExecutionProfile'
import TaskLaboratory from './TaskLaboratory'
import AddTodoModal from './AddTodoModal'
import DashboardView from './DashboardView'
import StrategyCenter from './StrategyCenter'
import OKRsView from './OKRsView'
import NotesView from './NotesView'
import CanvasView from './CanvasView'
import SkillsView from './SkillsView'
import DexView from './DexView'
import NotificationsView from './NotificationsView'
import ThinkView from './ThinkView'
import DocumentsView from './DocumentsView'
import FinanceView from './FinanceView'
import MyLynkGate from '../mylynk/MyLynkGate'

type BalanceView = 'kanban' | 'dashboard' | 'strategy' | 'okrs' | 'notes' | 'canvas' | 'skills' | 'dex' | 'notifications' | 'think' | 'documents' | 'finance'

const NAV_ITEMS: { id: BalanceView; label: string }[] = [
  { id: 'kanban', label: 'Kanban' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'strategy', label: 'Estrategia' },
  { id: 'okrs', label: 'OKRs' },
  { id: 'notes', label: 'Notes' },
  { id: 'canvas', label: 'Canvas' },
  { id: 'skills', label: 'Skills' },
  { id: 'dex', label: 'Dex' },
  { id: 'notifications', label: 'Notificaciones' },
  { id: 'think', label: 'THINK' },
  { id: 'documents', label: 'Documentos' },
  { id: 'finance', label: 'Finanzas' },
]

// Views that use full width (no right sidebar)
const FULL_WIDTH: BalanceView[] = ['dex', 'documents', 'think']

export default function BalanceApp(_: { windowId: string }) {
  return (
    <MyLynkGate appId="balance">
      <BalanceContent />
    </MyLynkGate>
  )
}

function BalanceContent() {
  const [view, setView] = useState<BalanceView>('kanban')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="relative flex h-full flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top nav */}
      <nav className="flex items-center gap-1 border-b border-white/[0.06] bg-slate-900/80 px-3 py-2 overflow-x-auto flex-shrink-0 [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              view === item.id
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.12 }}
              className="flex h-full flex-col overflow-hidden"
            >
              {view === 'kanban' && (
                <div className="flex h-full flex-col overflow-hidden">
                  <div className="flex-1 overflow-hidden"><KanbanBoard onAddTodo={() => setModalOpen(true)} /></div>
                  <div className="border-t border-white/[0.05] overflow-y-auto max-h-52 flex-shrink-0"><TaskLaboratory /></div>
                </div>
              )}
              {view === 'dashboard'     && <div className="flex-1 overflow-y-auto"><DashboardView /></div>}
              {view === 'strategy'      && <div className="flex-1 overflow-y-auto"><StrategyCenter /></div>}
              {view === 'okrs'          && <div className="flex-1 overflow-y-auto"><OKRsView /></div>}
              {view === 'notes'         && <NotesView />}
              {view === 'canvas'        && <CanvasView />}
              {view === 'skills'        && <div className="flex-1 overflow-y-auto"><SkillsView /></div>}
              {view === 'dex'           && <DexView />}
              {view === 'notifications' && <div className="flex-1 overflow-y-auto"><NotificationsView /></div>}
              {view === 'think'         && <div className="flex-1 overflow-y-auto"><ThinkView /></div>}
              {view === 'documents'     && <DocumentsView />}
              {view === 'finance'       && <div className="flex-1 overflow-y-auto"><FinanceView /></div>}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right sidebar — Execution Profile (hidden on full-width views) */}
        {!FULL_WIDTH.includes(view) && (
          <aside className="w-56 flex-shrink-0 overflow-y-auto border-l border-white/[0.06] bg-slate-900/60 p-3">
            <ExecutionProfile />
          </aside>
        )}
      </div>

      {/* FAB */}
      <motion.button
        type="button"
        onClick={() => setModalOpen((v) => !v)}
        animate={{ rotate: modalOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-label={modalOpen ? 'Cerrar' : 'Nueva tarea'}
        title={modalOpen ? 'Cerrar' : 'Nueva tarea'}
        className="absolute bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500 shadow-lg shadow-violet-900/40 transition hover:bg-violet-400"
      >
        {modalOpen ? <X size={18} /> : <Plus size={18} />}
      </motion.button>

      <AddTodoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
