import { motion } from 'framer-motion'
import { Briefcase, GitBranch, Clock } from 'lucide-react'

const projects = [
  { name: 'tauriq-core', branch: 'main', status: 'active', time: '2m' },
  { name: 'ai-bridge', branch: 'dev', status: 'paused', time: '1h' },
  { name: 'neural-ui', branch: 'feat/ui', status: 'idle', time: '3h' },
]

const statusColors = {
  active: 'bg-emerald-400',
  paused: 'bg-amber-400',
  idle: 'bg-slate-600',
}

export default function WorkspaceWidget() {
  return (
    <div className="widget-card">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase size={13} className="text-sky-400" />
        <span className="text-xs font-mono text-slate-400">Workspace</span>
      </div>

      <div className="space-y-2">
        {projects.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2 group cursor-pointer hover:bg-white/[0.03] rounded-lg px-1.5 py-1 transition-all"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${statusColors[p.status as keyof typeof statusColors]}`} />
            <span className="text-xs font-mono text-slate-300 flex-1 truncate">{p.name}</span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600">
              <GitBranch size={9} />
              <span>{p.branch}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-700">
              <Clock size={9} />
              <span>{p.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
