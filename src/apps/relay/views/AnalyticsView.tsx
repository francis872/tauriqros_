import { useRelayStore } from '../relayStore'
import { TrendingUp, Zap, MessageSquare, CheckCircle } from 'lucide-react'

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

// Last 7 days data (mock, scaled from real store values)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TOKEN_DATA = [320000, 410000, 380000, 520000, 490000, 290000, 450000]
const RESOLUTION_DATA = [91, 93, 89, 96, 94, 92, 95]
const MAX_TOKENS = Math.max(...TOKEN_DATA)
const BAR_H = 80

export default function AnalyticsView() {
  const { agents, workflows, totalTokensUsed, calls } = useRelayStore()

  const totalMessages = agents.reduce((s, a) => s + a.messagesHandled, 0)
  const avgUptime = agents.length ? (agents.reduce((s, a) => s + a.uptime, 0) / agents.length).toFixed(1) : '0'
  const totalRuns = workflows.reduce((s, w) => s + w.runs, 0)
  const completedCalls = calls.filter((c) => c.status === 'completed').length

  const kpis = [
    { label: 'Total Tokens', value: fmt(totalTokensUsed), sub: 'this period', Icon: Zap, color: 'text-violet-400' },
    { label: 'Messages', value: fmt(totalMessages), sub: 'all time', Icon: MessageSquare, color: 'text-cyan-400' },
    { label: 'Workflow Runs', value: totalRuns.toLocaleString(), sub: 'all workflows', Icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Avg Uptime', value: `${avgUptime}%`, sub: 'across agents', Icon: CheckCircle, color: 'text-amber-400' },
    { label: 'Calls Handled', value: completedCalls, sub: 'completed', Icon: CheckCircle, color: 'text-pink-400' },
    { label: 'Avg Resolution', value: '94.7%', sub: 'last 30 days', Icon: TrendingUp, color: 'text-indigo-400' },
  ]

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-5 min-h-0">
      <div className="mb-5">
        <h2 className="text-sm font-bold text-white">Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">System performance · last 7 days</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {kpis.map(({ label, value, sub, Icon, color }) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">{label}</span>
              <Icon size={12} className={color} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-700 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Token usage chart */}
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <p className="text-xs font-semibold text-slate-400 mb-4">Token Usage — Last 7 Days</p>
          <div className="flex items-end gap-2" style={{ height: BAR_H }}>
            {TOKEN_DATA.map((v, i) => {
              const h = Math.round((v / MAX_TOKENS) * BAR_H)
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-violet-500/60 hover:bg-violet-400/80 transition-all cursor-default" style={{ height: h }} title={fmt(v)} />
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 mt-2">
            {DAYS.map((d) => (
              <div key={d} className="flex-1 text-center text-[9px] text-slate-700">{d}</div>
            ))}
          </div>
        </div>

        {/* Resolution rate chart */}
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <p className="text-xs font-semibold text-slate-400 mb-4">Resolution Rate % — Last 7 Days</p>
          <div className="flex items-end gap-2" style={{ height: BAR_H }}>
            {RESOLUTION_DATA.map((v, i) => {
              const h = Math.round((v / 100) * BAR_H)
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-emerald-500/60 hover:bg-emerald-400/80 transition-all cursor-default" style={{ height: h }} title={`${v}%`} />
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 mt-2">
            {DAYS.map((d) => (
              <div key={d} className="flex-1 text-center text-[9px] text-slate-700">{d}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent performance table */}
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4">
        <p className="text-xs font-semibold text-slate-400 mb-3">Agent Performance</p>
        <div className="flex flex-col gap-1">
          {/* Header */}
          <div className="grid grid-cols-5 gap-4 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            <span>Agent</span>
            <span className="text-right">Messages</span>
            <span className="text-right">Uptime</span>
            <span className="text-right">Model</span>
            <span className="text-right">Status</span>
          </div>
          {agents.map((a) => (
            <div key={a.id} className="grid grid-cols-5 gap-4 rounded-xl px-2 py-2 text-xs hover:bg-white/[0.02] transition">
              <span className="text-slate-300 truncate">{a.name}</span>
              <span className="text-right text-slate-500">{fmt(a.messagesHandled)}</span>
              <span className="text-right text-slate-500">{a.uptime}%</span>
              <span className="text-right text-slate-600 truncate">{a.model}</span>
              <span className={`text-right capitalize font-semibold ${a.status === 'active' ? 'text-emerald-400' : a.status === 'idle' ? 'text-amber-400' : 'text-zinc-500'}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
