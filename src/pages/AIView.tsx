import { motion } from 'framer-motion'
import { Zap, Search, Network, Cpu, Database, Bot, Activity, ChevronRight } from 'lucide-react'
import { containerVariants, fadeInUp } from '../animations/variants'
import { useSystemStats } from '../hooks/useSystemStats'
import { useDesktopStore } from '../store/desktopStore'
import { APP_REGISTRY } from '../apps/registry'

const CAPABILITIES = [
  { id: 'nlp', label: 'Natural Language Commands', status: 'standby', icon: Bot },
  { id: 'automation', label: 'Workflow Automation', status: 'standby', icon: Activity },
  { id: 'local-model', label: 'Local AI Models', status: 'planned', icon: Cpu },
  { id: 'cloud-api', label: 'Cloud API Bridge', status: 'planned', icon: Network },
  { id: 'vector-db', label: 'Vector Memory Store', status: 'planned', icon: Database },
]

const STATUS_STYLES: Record<string, string> = {
  active: 'text-green-400/70 bg-green-500/10 border-green-500/20',
  standby: 'text-sky-400/70 bg-sky-500/10 border-sky-500/20',
  planned: 'text-slate-600 bg-white/[0.04] border-white/[0.06]',
}

export default function AIView() {
  const { aiActivity } = useSystemStats()
  const { openApp } = useDesktopStore()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full overflow-y-auto p-6 no-scrollbar"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-200">AI Center</h1>
          <p className="text-xs text-slate-600 mt-0.5 font-mono">neural bridge v0.1 · simulation mode</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openApp('ai', APP_REGISTRY.ai.label, APP_REGISTRY.ai.defaultWidth, APP_REGISTRY.ai.defaultHeight)}
            className="tauriq-btn-primary text-xs"
          >
            <Zap size={12} /> Launch AI
          </button>
          <button
            onClick={() => openApp('ascii-search', APP_REGISTRY['ascii-search'].label, APP_REGISTRY['ascii-search'].defaultWidth, APP_REGISTRY['ascii-search'].defaultHeight)}
            className="tauriq-btn-secondary text-xs"
          >
            <Search size={12} /> Open ASCII Search
          </button>
        </div>
      </motion.div>

      {/* Status card */}
      <motion.div variants={fadeInUp} className="widget-card mb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.06),transparent_60%)]" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Zap size={24} className="text-sky-400" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border border-sky-500/30"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">TAURIQ Neural Bridge</p>
            <p className="text-xs text-slate-600 mt-0.5">Initialized · Simulation mode active</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-[10px] font-mono text-sky-400/60">STANDBY · {aiActivity}% activity</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Capabilities */}
      <motion.div variants={fadeInUp} className="widget-card mb-4">
        <p className="text-[10px] font-mono text-slate-600 tracking-widest mb-3">AI CAPABILITIES</p>
        <div className="space-y-2">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
            >
              <div className="flex items-center gap-2">
                <cap.icon size={12} className="text-slate-600" />
                <span className="text-xs text-slate-400">{cap.label}</span>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${STATUS_STYLES[cap.status]}`}>
                {cap.status}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Architecture preview */}
      <motion.div variants={fadeInUp} className="widget-card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-mono text-slate-600 tracking-widest">ARCHITECTURE</p>
          <ChevronRight size={12} className="text-slate-700" />
        </div>
        <div className="space-y-2 text-[11px] font-mono">
          {[
            'React UI ──→ Tauri IPC ──→ Python Runtime',
            'Python Runtime ──→ AI Engine (llama.cpp)',
            'AI Engine ──→ Agent Framework (LangChain)',
            'Agent Framework ──→ Tool Registry',
          ].map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="text-slate-700"
            >
              {line}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
