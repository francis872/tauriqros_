import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Bot, Workflow, Database, Mic, Eye, BarChart2, ShoppingBag, GitBranch } from 'lucide-react'
import DashboardView from './views/DashboardView'
import AgentsView from './views/AgentsView'
import StudioView from './views/StudioView'
import DataView from './views/DataView'
import VoiceView from './views/VoiceView'
import VisionView from './views/VisionView'
import WorkflowsView from './views/WorkflowsView'
import AnalyticsView from './views/AnalyticsView'
import MarketplaceView from './views/MarketplaceView'
import MyLynkGate from '../mylynk/MyLynkGate'

type RelayView = 'dashboard' | 'agents' | 'studio' | 'data' | 'voice' | 'vision' | 'workflows' | 'analytics' | 'marketplace'

const NAV_ITEMS: { id: RelayView; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard',   label: 'Dashboard',    Icon: LayoutDashboard },
  { id: 'agents',      label: 'Agents',       Icon: Bot },
  { id: 'studio',      label: 'Studio',       Icon: GitBranch },
  { id: 'workflows',   label: 'Workflows',    Icon: Workflow },
  { id: 'data',        label: 'Data',         Icon: Database },
  { id: 'voice',       label: 'Voice',        Icon: Mic },
  { id: 'vision',      label: 'Vision',       Icon: Eye },
  { id: 'analytics',   label: 'Analytics',    Icon: BarChart2 },
  { id: 'marketplace', label: 'Marketplace',  Icon: ShoppingBag },
]

export default function RelayApp(_: { windowId: string }) {
  return (
    <MyLynkGate appId="relay">
      <RelayContent />
    </MyLynkGate>
  )
}

function RelayContent() {
  const [view, setView] = useState<RelayView>('dashboard')

  return (
    <div className="relative flex h-full flex-col bg-zinc-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] bg-zinc-950/90 px-4 py-2.5 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 3 L6 1 L10 3 L10 7 L6 11 L2 7 Z" stroke="white" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
              <circle cx="6" cy="6" r="1.5" fill="white"/>
            </svg>
          </div>
          <span className="text-xs font-bold tracking-widest text-white uppercase">Relay</span>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center gap-0.5 overflow-x-auto [&::-webkit-scrollbar]:hidden flex-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              onClick={() => setView(id)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                view === id
                  ? 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/40'
                  : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Status pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 flex-shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SYSTEM ONLINE
        </div>
      </header>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.1 }}
          className="flex flex-1 min-h-0 overflow-hidden"
        >
          {view === 'dashboard'   && <DashboardView />}
          {view === 'agents'      && <AgentsView />}
          {view === 'studio'      && <StudioView />}
          {view === 'workflows'   && <WorkflowsView />}
          {view === 'data'        && <DataView />}
          {view === 'voice'       && <VoiceView />}
          {view === 'vision'      && <VisionView />}
          {view === 'analytics'   && <AnalyticsView />}
          {view === 'marketplace' && <MarketplaceView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
