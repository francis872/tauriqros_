import { motion } from 'framer-motion'
import { Plus, Circle, Clock, ArrowRight } from 'lucide-react'
import { containerVariants, fadeInUp } from '../animations/variants'

const WORKSPACES = [
  { id: '1', name: 'TAURIQ Core', tasks: 12, done: 7, color: 'sky', tag: 'dev' },
  { id: '2', name: 'AI Research', tasks: 8, done: 3, color: 'violet', tag: 'research' },
  { id: '3', name: 'Design System', tasks: 5, done: 5, color: 'cyan', tag: 'design' },
]

const RECENT = [
  { name: 'neural-bridge.rs', time: '2m ago', type: 'rust' },
  { name: 'Desktop.tsx', time: '18m ago', type: 'tsx' },
  { name: 'store.ts', time: '1h ago', type: 'ts' },
  { name: 'main.py', time: '3h ago', type: 'python' },
]

const EXT_COLORS: Record<string, string> = {
  rust: 'text-orange-400/70',
  tsx: 'text-cyan-400/70',
  ts: 'text-blue-400/70',
  python: 'text-green-400/70',
}

export default function WorkspaceView() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full overflow-y-auto p-6 no-scrollbar"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-200">Workspace</h1>
          <p className="text-xs text-slate-600 mt-0.5 font-mono">3 active projects</p>
        </div>
        <button className="tauriq-btn-primary text-xs">
          <Plus size={12} /> New Project
        </button>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {WORKSPACES.map((ws, i) => {
          const pct = Math.round((ws.done / ws.tasks) * 100)
          return (
            <motion.div
              key={ws.id}
              variants={fadeInUp}
              className="widget-card cursor-pointer group hover:border-sky-500/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-[9px] font-mono tracking-widest ${
                    ws.color === 'sky' ? 'text-sky-500/50' :
                    ws.color === 'violet' ? 'text-violet-500/50' : 'text-cyan-500/50'
                  }`}>{ws.tag.toUpperCase()}</span>
                  <h3 className="text-sm font-medium text-slate-200 mt-0.5">{ws.name}</h3>
                </div>
                <ArrowRight size={12} className="text-slate-700 group-hover:text-slate-500 transition-colors mt-1" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-600 mb-1">
                  <span>{ws.done}/{ws.tasks} tasks</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 + 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full ${
                      ws.color === 'sky' ? 'bg-sky-500' :
                      ws.color === 'violet' ? 'bg-violet-500' : 'bg-cyan-500'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div variants={fadeInUp} className="widget-card">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={12} className="text-slate-600" />
          <span className="text-[10px] font-mono text-slate-600 tracking-widest">RECENT FILES</span>
        </div>
        <div className="space-y-2">
          {RECENT.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex items-center justify-between py-1.5 hover:bg-white/[0.03] rounded-lg px-2 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Circle size={6} className={EXT_COLORS[f.type] ?? 'text-slate-600'} fill="currentColor" />
                <span className="text-sm text-slate-400">{f.name}</span>
              </div>
              <span className="text-[10px] text-slate-700 font-mono">{f.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
