import { useRelayStore } from '../relayStore'
import { motion } from 'framer-motion'
import { Bot, Workflow, Database, Zap, TrendingUp, MessageSquare, Clock } from 'lucide-react'

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-400',
  idle: 'bg-amber-400',
  training: 'bg-violet-400',
  offline: 'bg-zinc-600',
}

const TYPE_ICON: Record<string, string> = {
  sales: '💼', support: '🎧', analyst: '📊', voice: '🎤', vision: '👁️', orchestrator: '🔮',
}

export default function DashboardView() {
  const { agents, workflows, connections, calls, totalTokensUsed } = useRelayStore()

  const activeAgents = agents.filter((a) => a.status === 'active').length
  const activeWorkflows = workflows.filter((w) => w.status === 'active').length
  const totalMessages = agents.reduce((s, a) => s + a.messagesHandled, 0)
  const connectedSources = connections.filter((c) => c.status === 'connected').length
  const activeCall = calls.find((c) => c.status === 'active')
  const avgUptime = agents.length ? (agents.reduce((s, a) => s + a.uptime, 0) / agents.length).toFixed(1) : '0'

  const stats = [
    { label: 'Active Agents', value: `${activeAgents}/${agents.length}`, sub: `${avgUptime}% avg uptime`, Icon: Bot, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Active Workflows', value: activeWorkflows, sub: `${workflows.reduce((s, w) => s + w.runs, 0).toLocaleString()} total runs`, Icon: Workflow, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Messages Handled', value: fmt(totalMessages), sub: 'across all agents', Icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Data Sources', value: `${connectedSources}/${connections.length}`, sub: 'connected', Icon: Database, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Tokens Used', value: fmt(totalTokensUsed), sub: 'this billing period', Icon: Zap, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { label: 'Avg Resolve Rate', value: '94.7%', sub: 'last 30 days', Icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  ]

  const recentActivity = [
    { icon: '⚡', text: 'Atlas calificó 12 leads en los últimos 30 min', ts: Date.now() - 120000 },
    { icon: '✅', text: 'Iris resolvió ticket #4821 — Tiempo: 2 min', ts: Date.now() - 480000 },
    { icon: '📊', text: 'Nova generó Weekly Report — 8 páginas', ts: Date.now() - 3600000 },
    { icon: '📞', text: 'Echo completó llamada con Carlos Mendez (4:03)', ts: Date.now() - 7200000 },
    { icon: '🔄', text: 'Workflow "Lead Qualification" ejecutado × 14 hoy', ts: Date.now() - 1800000 },
    { icon: '🔌', text: 'Salesforce CRM sincronizado — 14,823 registros', ts: Date.now() - 3600000 },
  ].sort((a, b) => b.ts - a.ts)

  return (
    <div className="flex flex-1 flex-col gap-0 overflow-y-auto p-5 min-h-0">
      {/* Headline */}
      <div className="mb-5">
        <h1 className="text-lg font-bold text-white">System Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">AI Workforce Operating System · all systems nominal</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map(({ label, value, sub, Icon, color, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-4 ${bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Agent fleet */}
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5"><Bot size={12} /> Agent Fleet</p>
          <div className="flex flex-col gap-2">
            {agents.map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[a.status]}`} />
                  <span className="text-xs text-slate-300">{TYPE_ICON[a.type]} {a.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  <span>{fmt(a.messagesHandled)} msgs</span>
                  <span className={`capitalize ${a.status === 'active' ? 'text-emerald-500' : a.status === 'idle' ? 'text-amber-500' : 'text-slate-600'}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5"><Clock size={12} /> Live Activity</p>
          {activeCall && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-300 font-medium">Live call — {activeCall.contact} — {Math.floor((Date.now() - activeCall.startedAt) / 1000)}s</span>
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            {recentActivity.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sm leading-none mt-px">{item.icon}</span>
                <div>
                  <p className="text-[11px] text-slate-300 leading-snug">{item.text}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(item.ts)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
