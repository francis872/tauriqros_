import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Network, Brain, GitBranch, Bot, AlertTriangle, TrendingUp,
  FileSignature, CheckSquare, Search, ChevronRight, Clock,
  Building2, Scale, BarChart3, Code2, Sparkles, Send,
  User, FolderOpen, MessageSquare, Circle, ArrowRight, Inbox,
  LogOut, ShieldCheck, Layers
} from 'lucide-react'
import { useMyLynkAuth } from './mylynk/mylynkAuthStore'
import MyLynkSignIn from './mylynk/MyLynkSignIn'

// ── Types ─────────────────────────────────────────────────────────────────────

type LynkView = 'intelligence' | 'memory' | 'graph' | 'agents' | 'account'

interface IntelItem {
  id: string
  category: 'decision' | 'opportunity' | 'risk' | 'task' | 'contract'
  title: string
  body: string
  from: string
  time: string
  urgency: 'critical' | 'high' | 'medium' | 'low'
  project?: string
  actions: string[]
}

interface MemoryEntry {
  id: string
  query: string
  answer: string
  sources: number
  timestamp: string
}

interface AgentDef {
  id: string
  name: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  bg: string
  ring: string
  status: 'active' | 'idle' | 'processing'
  lastAction: string
  processed: number
  queue: number
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const INTEL_ITEMS: IntelItem[] = [
  {
    id: 'i1', category: 'decision', urgency: 'critical',
    title: 'Aprobación requerida — Propuesta Nexus Labs',
    body: 'Carlos Mendoza envió la propuesta actualizada (v3). El equipo legal revisó. Depende de tu firma para avanzar al cierre.',
    from: 'Carlos Mendoza', time: 'hace 12 min', project: 'Nexus Labs',
    actions: ['Aprobar', 'Solicitar cambios', 'Delegar'],
  },
  {
    id: 'i2', category: 'opportunity', urgency: 'high',
    title: 'Potencial cliente Enterprise — Orion Group',
    body: 'Tres correos en 48h desde dirección C-level de Orion Group. Señales de compra detectadas. Presupuesto estimado: $240K ARR.',
    from: 'Sofia Reyes (BD)', time: 'hace 38 min', project: 'Pipeline Q3',
    actions: ['Agendar demo', 'Ver perfil', 'Asignar a comercial'],
  },
  {
    id: 'i3', category: 'contract', urgency: 'critical',
    title: 'Contrato — firma digital pendiente',
    body: 'MSA con Vertex Capital expira en 72h. Legal aprobó el borrador final. Única acción pendiente: firma electrónica.',
    from: 'Legal Team', time: 'hace 1 h', project: 'Vertex Capital',
    actions: ['Firmar ahora', 'Ver contrato', 'Postponer'],
  },
  {
    id: 'i4', category: 'task', urgency: 'high',
    title: '5 tareas bloqueadas sin respuesta tuya',
    body: 'Proyectos Atlas (×2), Orion (×2), Migration DB (×1) están detenidos esperando tu input. El equipo lleva 3+ días bloqueado.',
    from: 'MY-LYNK Agents', time: 'hace 2 h', project: 'Múltiples',
    actions: ['Ver tareas', 'Responder en bloque', 'Delegar todo'],
  },
  {
    id: 'i5', category: 'risk', urgency: 'medium',
    title: 'Posible pérdida de cliente — Drifting signal',
    body: 'NPS de Delta Corp bajó 18 puntos. Último correo hace 3 semanas sin respuesta desde su lado. Patrón de churn detectado.',
    from: 'Agente Comercial', time: 'hace 4 h', project: 'Delta Corp',
    actions: ['Ver historial', 'Enviar touchpoint', 'Escalar a CS'],
  },
  {
    id: 'i6', category: 'opportunity', urgency: 'low',
    title: 'Introducción — Ex-CTO de Stripe interesado',
    body: 'Conexión en LinkedIn derivó en correo directo. Mencionó interés en asesoría o inversión. Respuesta sugerida lista.',
    from: 'Red de contactos', time: 'hace 6 h', project: 'Inversores',
    actions: ['Ver correo', 'Responder (IA)', 'Ignorar'],
  },
]

const MEMORY_PRESETS: MemoryEntry[] = [
  {
    id: 'm1',
    query: '¿Qué acordamos con Nexus Labs en la reunión de octubre?',
    answer: 'En la reunión del 14-oct acordaron: entrega Phase 1 en diciembre, precio fijo de $85K, cláusula de soporte de 12 meses incluida. Carlos Mendoza confirmó por correo el 16-oct.',
    sources: 7, timestamp: 'hace 2 días',
  },
  {
    id: 'm2',
    query: '¿Cuál es el historial de pagos de Vertex Capital?',
    answer: 'Vertex ha pagado 3/3 facturas en plazo (promedio 8 días). Última factura $42K cobrada el 3-jun. Sin disputas históricas. Clasificación: cliente A+.',
    sources: 4, timestamp: 'hace 5 días',
  },
  {
    id: 'm3',
    query: '¿Qué problemas técnicos reportó Delta Corp?',
    answer: 'Tres tickets en Q2: latencia API (resuelto), bug en exportación CSV (resuelto), solicitud de SSO SAML (pendiente en roadmap). Último contacto técnico: 28-may.',
    sources: 12, timestamp: 'hace 1 semana',
  },
]

const AGENTS: AgentDef[] = [
  {
    id: 'commercial', name: 'Agente Comercial',
    icon: BarChart3, color: 'text-sky-300', bg: 'bg-sky-500/10', ring: 'ring-sky-500/30',
    status: 'active', lastAction: 'Clasificó lead de Orion Group como calificado', processed: 1847, queue: 3,
  },
  {
    id: 'legal', name: 'Agente Legal',
    icon: Scale, color: 'text-violet-300', bg: 'bg-violet-500/10', ring: 'ring-violet-500/30',
    status: 'processing', lastAction: 'Revisando cláusulas de MSA Vertex Capital', processed: 312, queue: 1,
  },
  {
    id: 'finance', name: 'Agente Financiero',
    icon: Building2, color: 'text-emerald-300', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30',
    status: 'active', lastAction: 'Extrajo términos de pago de 4 correos entrantes', processed: 924, queue: 0,
  },
  {
    id: 'technical', name: 'Agente Técnico',
    icon: Code2, color: 'text-amber-300', bg: 'bg-amber-500/10', ring: 'ring-amber-500/30',
    status: 'idle', lastAction: 'Creó ticket desde correo de Delta Corp (SSO)', processed: 588, queue: 0,
  },
]

// ── Graph nodes & edges ────────────────────────────────────────────────────────

const GRAPH_NODES = [
  { id: 'you',    x: 380, y: 240, label: 'Tú',            type: 'self' },
  { id: 'nexus',  x: 180, y: 120, label: 'Nexus Labs',    type: 'project' },
  { id: 'vertex', x: 580, y: 100, label: 'Vertex Capital',type: 'project' },
  { id: 'delta',  x: 580, y: 360, label: 'Delta Corp',    type: 'project' },
  { id: 'orion',  x: 180, y: 360, label: 'Orion Group',   type: 'lead' },
  { id: 'carlos', x: 90,  y: 240, label: 'Carlos M.',     type: 'person' },
  { id: 'sofia',  x: 680, y: 240, label: 'Sofia R.',      type: 'person' },
  { id: 'legal',  x: 380, y: 80,  label: 'Legal Team',    type: 'team' },
  { id: 'q3',     x: 380, y: 400, label: 'Pipeline Q3',   type: 'pipeline' },
]

const GRAPH_EDGES = [
  { from: 'you',    to: 'nexus',  label: '14 correos' },
  { from: 'you',    to: 'vertex', label: 'contrato' },
  { from: 'you',    to: 'delta',  label: '⚠ churn risk' },
  { from: 'you',    to: 'orion',  label: 'lead caliente' },
  { from: 'carlos', to: 'nexus',  label: '' },
  { from: 'sofia',  to: 'orion',  label: '' },
  { from: 'legal',  to: 'vertex', label: '' },
  { from: 'q3',     to: 'orion',  label: '' },
  { from: 'you',    to: 'legal',  label: '' },
  { from: 'you',    to: 'q3',     label: '' },
]

// ── Color helpers ──────────────────────────────────────────────────────────────

const URGENCY_STYLE: Record<string, string> = {
  critical: 'border-red-500/40 bg-red-500/8',
  high:     'border-orange-500/30 bg-orange-500/6',
  medium:   'border-yellow-500/25 bg-yellow-500/5',
  low:      'border-white/[0.06] bg-white/[0.02]',
}

const URGENCY_DOT: Record<string, string> = {
  critical: 'bg-red-400 animate-pulse',
  high:     'bg-orange-400',
  medium:   'bg-yellow-400',
  low:      'bg-slate-500',
}

const CAT_STYLE: Record<string, string> = {
  decision:    'border-violet-500/40 bg-violet-500/15 text-violet-300',
  opportunity: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
  risk:        'border-red-500/40 bg-red-500/15 text-red-300',
  task:        'border-amber-500/40 bg-amber-500/15 text-amber-300',
  contract:    'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
}

const CAT_LABEL: Record<string, string> = {
  decision: 'Decisión', opportunity: 'Oportunidad', risk: 'Riesgo', task: 'Tareas', contract: 'Contrato',
}

const NODE_STYLE: Record<string, { fill: string; stroke: string; text: string }> = {
  self:     { fill: '#7c3aed', stroke: '#a78bfa', text: '#fff' },
  project:  { fill: '#0e4a7a', stroke: '#38bdf8', text: '#bae6fd' },
  lead:     { fill: '#065f46', stroke: '#34d399', text: '#6ee7b7' },
  person:   { fill: '#1e1b4b', stroke: '#818cf8', text: '#c7d2fe' },
  team:     { fill: '#3f1f00', stroke: '#fb923c', text: '#fed7aa' },
  pipeline: { fill: '#1a1a2e', stroke: '#e879f9', text: '#f0abfc' },
}

const NAV_ITEMS: { id: LynkView; label: string; Icon: React.ComponentType<{ size?: number; className?: string }>; count?: number }[] = [
  { id: 'intelligence', label: 'Inteligencia', Icon: Brain,     count: 6 },
  { id: 'memory',       label: 'Memoria',      Icon: Search },
  { id: 'graph',        label: 'Grafo',        Icon: GitBranch },
  { id: 'agents',       label: 'Agentes',      Icon: Bot,       count: 2 },
  { id: 'account',      label: 'Mi cuenta',    Icon: User },
]

// ── Root component ─────────────────────────────────────────────────────────────

export default function MyLynkApp(_: { windowId: string }) {
  const [view, setView] = useState<LynkView>('intelligence')
  const currentAccount = useMyLynkAuth((s) => s.currentAccount)
  const logout = useMyLynkAuth((s) => s.logout)

  if (!currentAccount) {
    return <MyLynkSignIn appId="mylynk" />
  }

  const counts = {
    decision:    INTEL_ITEMS.filter(i => i.category === 'decision').length,
    opportunity: INTEL_ITEMS.filter(i => i.category === 'opportunity').length,
    contract:    INTEL_ITEMS.filter(i => i.category === 'contract').length,
    task:        INTEL_ITEMS.filter(i => i.category === 'task').length,
    risk:        INTEL_ITEMS.filter(i => i.category === 'risk').length,
  }

  return (
    <div className="flex h-full flex-col bg-[#0b0b12] text-slate-100 overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] bg-[#0b0b12]/95 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2 mr-1">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-violet-600 ring-1 ring-violet-400/30">
            <Network size={12} className="text-white" />
          </div>
          <span className="text-xs font-black tracking-[0.2em] text-white uppercase">MY-LYNK</span>
        </div>

        <nav className="flex items-center gap-0.5 flex-1">
          {NAV_ITEMS.map(({ id, label, Icon, count }) => (
            <button key={id} onClick={() => setView(id)}
              className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                view === id
                  ? 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/40'
                  : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              <Icon size={12} />
              <span>{label}</span>
              {count != null && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Account + stats */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-[10px]">
            <Stat n={counts.decision}    label="decisiones" color="text-violet-400" />
            <Stat n={counts.opportunity} label="oportunidades" color="text-sky-400" />
            <Stat n={counts.contract}    label="contratos" color="text-emerald-400" />
            <Stat n={counts.task}        label="bloqueadas" color="text-amber-400" />
            <Stat n={counts.risk}        label="riesgos" color="text-red-400" />
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white flex-shrink-0">
              {currentAccount.displayName.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-[11px] text-slate-300 max-w-[100px] truncate">{currentAccount.displayName}</span>
          </div>
          <button type="button" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión"
            className="rounded-lg p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition">
            <LogOut size={13} />
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={view}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}
          className="flex-1 overflow-y-auto p-4 no-scrollbar"
        >
          {view === 'intelligence' && <IntelligenceView items={INTEL_ITEMS} counts={counts} />}
          {view === 'memory'       && <MemoryView />}
          {view === 'graph'        && <GraphView />}
          {view === 'agents'       && <AgentsView />}
          {view === 'account'      && <AccountView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className={`font-bold ${color}`}>{n}</span>
      <span className="text-slate-600">{label}</span>
    </span>
  )
}

// ── Intelligence View ──────────────────────────────────────────────────────────

function IntelligenceView({ items, counts }: { items: IntelItem[]; counts: Record<string, number> }) {
  const [selected, setSelected] = useState<string | null>(null)

  const summaryCards = [
    { key: 'decision',    label: 'Decisiones',    n: counts.decision,    color: 'border-violet-500/30 bg-violet-500/8 text-violet-300', icon: CheckSquare },
    { key: 'opportunity', label: 'Oportunidades', n: counts.opportunity, color: 'border-sky-500/30 bg-sky-500/8 text-sky-300',           icon: TrendingUp },
    { key: 'contract',    label: 'Contratos',     n: counts.contract,    color: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-300', icon: FileSignature },
    { key: 'task',        label: 'Bloqueadas',    n: counts.task,        color: 'border-amber-500/30 bg-amber-500/8 text-amber-300',       icon: Clock },
    { key: 'risk',        label: 'Riesgos',       n: counts.risk,        color: 'border-red-500/30 bg-red-500/8 text-red-300',             icon: AlertTriangle },
  ]

  return (
    <div className="space-y-4">
      {/* Zero-inbox hero */}
      <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-600/10 to-indigo-600/5 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Inbox size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-violet-200">Bandeja de Inteligencia — Inbox permanentemente en cero</p>
          <span className="ml-auto rounded-full bg-violet-600/30 px-2 py-0.5 text-[10px] font-bold text-violet-300 ring-1 ring-violet-500/30">
            LA IA GESTIONA
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          No ves correos. Ves únicamente lo que requiere tu atención. MY-LYNK procesó{' '}
          <span className="text-violet-300 font-semibold">247 mensajes hoy</span> y condensó todo en{' '}
          <span className="text-white font-semibold">{items.length} elementos accionables</span>.
        </p>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-5 gap-2">
        {summaryCards.map(({ key, label, n, color, icon: Icon }) => (
          <div key={key} className={`rounded-xl border p-3 ${color}`}>
            <Icon size={14} className="mb-1 opacity-70" />
            <p className="text-xl font-black">{n}</p>
            <p className="text-[10px] opacity-60 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item) => {
          const isOpen = selected === item.id
          return (
            <motion.div key={item.id} layout
              className={`rounded-xl border cursor-pointer transition-all ${URGENCY_STYLE[item.urgency]} ${isOpen ? 'ring-1 ring-violet-500/30' : ''}`}
              onClick={() => setSelected(isOpen ? null : item.id)}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${URGENCY_DOT[item.urgency]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${CAT_STYLE[item.category]}`}>
                      {CAT_LABEL[item.category]}
                    </span>
                    {item.project && (
                      <span className="text-[10px] text-slate-600 font-mono">{item.project}</span>
                    )}
                    <span className="ml-auto text-[10px] text-slate-700 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-100 leading-snug">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.from}</p>
                </div>
                <ChevronRight size={14} className={`text-slate-700 transition-transform mt-1 shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/[0.06] px-4 pb-3 pt-3 space-y-3">
                      {/* AI summary */}
                      <div className="flex gap-2">
                        <Sparkles size={13} className="text-violet-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-400 leading-relaxed">{item.body}</p>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        {item.actions.map((a, i) => (
                          <button key={a}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95 ${
                              i === 0
                                ? 'border-violet-500/60 bg-violet-600/20 text-violet-200 hover:bg-violet-600/30'
                                : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07]'
                            }`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Memory View ────────────────────────────────────────────────────────────────

function MemoryView() {
  const [query, setQuery] = useState('')
  const [history] = useState<MemoryEntry[]>(MEMORY_PRESETS)
  const [typing, setTyping] = useState(false)
  const [result, setResult] = useState<MemoryEntry | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const SUGGESTIONS = [
    '¿Qué acordamos con Nexus Labs en octubre?',
    '¿Cuál es el historial de pagos de Vertex?',
    '¿Qué problemas reportó Delta Corp?',
    '¿Quién aprobó la propuesta de Orion?',
  ]

  const handleAsk = (q: string) => {
    if (!q.trim()) return
    setQuery(q)
    setTyping(true)
    setResult(null)
    setTimeout(() => {
      setTyping(false)
      setResult({
        id: 'live',
        query: q,
        answer: 'Basado en 6 correos, 2 reuniones y 1 documento: no se encontró una respuesta exacta en la memoria organizacional para esta consulta. MY-LYNK puede aprender más si indexas correos adicionales.',
        sources: 6,
        timestamp: 'ahora',
      })
    }, 1200)
  }

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-violet-200">Memoria Organizacional</p>
        </div>
        <p className="text-xs text-slate-500">
          Toda tu comunicación — correos, reuniones, documentos — indexada como conocimiento consultable en lenguaje natural.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAsk(query) }}
          placeholder="¿Qué acordamos con el cliente hace 8 meses?"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-9 pr-10 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/50 focus:bg-violet-500/5 focus:ring-1 focus:ring-violet-500/20 transition-all"
        />
        <button onClick={() => handleAsk(query)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-violet-600/30 p-1.5 text-violet-300 hover:bg-violet-600/50 transition-all"
        >
          <Send size={12} />
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => handleAsk(s)}
            className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] hover:border-violet-500/30 transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Live result */}
      <AnimatePresence>
        {typing && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4"
          >
            <div className="flex items-center gap-2 text-xs text-violet-300">
              <Sparkles size={13} className="animate-spin" />
              Consultando memoria organizacional…
            </div>
          </motion.div>
        )}
        {result && !typing && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-violet-500/30 bg-violet-500/8 p-4 space-y-2"
          >
            <p className="text-[10px] font-mono text-violet-500">&gt; {result.query}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{result.answer}</p>
            <p className="text-[10px] text-slate-600">{result.sources} fuentes · {result.timestamp}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <div>
        <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-600">Consultas recientes</p>
        <div className="space-y-2">
          {history.map(h => (
            <div key={h.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 cursor-pointer hover:border-violet-500/20 hover:bg-violet-500/5 transition-all"
              onClick={() => handleAsk(h.query)}
            >
              <div className="flex items-start gap-2">
                <MessageSquare size={12} className="text-slate-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300">{h.query}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{h.answer}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] text-slate-700">{h.sources} fuentes</p>
                  <p className="text-[9px] text-slate-700">{h.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Graph View ─────────────────────────────────────────────────────────────────

function GraphView() {
  const [hovered, setHovered] = useState<string | null>(null)

  const nodeMap = Object.fromEntries(GRAPH_NODES.map(n => [n.id, n]))

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-violet-200">Grafo de Relaciones</p>
        </div>
        <p className="text-xs text-slate-500">Cada correo se convierte en conocimiento. Las relaciones entre personas, proyectos y documentos se mapean automáticamente.</p>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <svg viewBox="0 0 760 480" className="w-full h-64" style={{ background: 'transparent' }}>
          {/* Edges */}
          {GRAPH_EDGES.map((e, i) => {
            const from = nodeMap[e.from]
            const to   = nodeMap[e.to]
            const isActive = hovered === e.from || hovered === e.to
            return (
              <g key={i}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isActive ? '#7c3aed' : '#ffffff14'}
                  strokeWidth={isActive ? 1.5 : 1}
                  strokeDasharray={isActive ? undefined : '4 4'}
                />
                {e.label && isActive && (
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 4}
                    fill="#a78bfa" fontSize="9" textAnchor="middle" fontFamily="monospace"
                  >{e.label}</text>
                )}
              </g>
            )
          })}
          {/* Nodes */}
          {GRAPH_NODES.map(node => {
            const s = NODE_STYLE[node.type]
            const isActive = hovered === node.id
            const r = node.type === 'self' ? 24 : 18
            return (
              <g key={node.id} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <circle cx={node.x} cy={node.y} r={r + (isActive ? 4 : 0)}
                  fill={s.fill} stroke={s.stroke} strokeWidth={isActive ? 2 : 1}
                  style={{ transition: 'all 0.2s' }}
                />
                <text x={node.x} y={node.y + 4} textAnchor="middle"
                  fill={s.text} fontSize={node.type === 'self' ? '10' : '9'} fontWeight="bold" fontFamily="monospace"
                >{node.label.length > 10 ? node.label.slice(0, 10) + '…' : node.label}</text>
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[0.05] text-[10px]">
          {[
            { color: '#7c3aed', label: 'Tú' },
            { color: '#0e4a7a', label: 'Proyectos', stroke: '#38bdf8' },
            { color: '#065f46', label: 'Leads',    stroke: '#34d399' },
            { color: '#1e1b4b', label: 'Personas', stroke: '#818cf8' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color, boxShadow: l.stroke ? `0 0 0 1px ${l.stroke}` : undefined }} />
              <span className="text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection list */}
      <div>
        <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-600">Conexiones activas</p>
        <div className="grid grid-cols-2 gap-2">
          {GRAPH_EDGES.filter(e => e.label).map((e, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <User size={10} className="text-slate-600 shrink-0" />
              <span className="text-[11px] text-slate-400 font-mono">{e.from}</span>
              <ArrowRight size={10} className="text-slate-700 shrink-0" />
              <span className="text-[11px] text-slate-400 font-mono">{e.to}</span>
              {e.label && <span className="ml-auto text-[9px] text-violet-400">{e.label}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Agents View ────────────────────────────────────────────────────────────────

function AgentsView() {
  const [active, setActive] = useState<string | null>(null)

  const STATUS_STYLE: Record<string, string> = {
    active:     'bg-emerald-400 animate-pulse',
    processing: 'bg-amber-400 animate-pulse',
    idle:       'bg-slate-600',
  }

  const STATUS_LABEL: Record<string, string> = {
    active: 'activo', processing: 'procesando', idle: 'en reposo',
  }

  const SAMPLE_ACTIVITY: Record<string, string[]> = {
    commercial:  ['Orion Group → lead calificado', 'Delta Corp → riesgo churn detectado', 'Ex-CTO Stripe → perfil enriquecido'],
    legal:       ['MSA Vertex → cláusulas auditadas', 'NDA Nexus → vigencia OK', 'Revisión en curso: MSA Vertex v3'],
    finance:     ['Nexus $85K → factura extraída', 'Vertex $42K → pago verificado', 'Orion $240K ARR → estimación'],
    technical:   ['Delta Corp → ticket SSO creado', 'Atlas → bloqueo sin respuesta', 'Migration DB → tarea asignada'],
  }

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-violet-200">Agentes Autónomos</p>
          <span className="ml-auto text-[10px] text-slate-600">Cada correo → analizado, clasificado, accionado</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Cuando llega un correo, los agentes lo analizan en paralelo, extraen tareas, actualizan proyectos y sugieren respuestas.
          Tú solo apruebas decisiones.
        </p>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-2 gap-3">
        {AGENTS.map(agent => {
          const Icon = agent.icon
          const isOpen = active === agent.id
          return (
            <motion.div key={agent.id} layout
              className={`rounded-xl border ${agent.ring ? 'ring-1 ' + agent.ring : ''} ${
                agent.status === 'processing' ? 'border-amber-500/30' :
                agent.status === 'active'     ? 'border-emerald-500/20' :
                'border-white/[0.07]'
              } bg-white/[0.02] cursor-pointer transition-all hover:bg-white/[0.04]`}
              onClick={() => setActive(isOpen ? null : agent.id)}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${agent.bg}`}>
                    <Icon size={14} className={agent.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200">{agent.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[agent.status]}`} />
                      <span className="text-[9px] text-slate-600">{STATUS_LABEL[agent.status]}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">{agent.lastAction}</p>
                <div className="mt-2 flex items-center gap-3 text-[9px] font-mono text-slate-700">
                  <span className={agent.color}>{agent.processed.toLocaleString()} procesados</span>
                  {agent.queue > 0 && (
                    <span className="text-amber-400">{agent.queue} en cola</span>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
                    className="overflow-hidden border-t border-white/[0.06]"
                  >
                    <div className="p-3 space-y-1">
                      {(SAMPLE_ACTIVITY[agent.id] ?? []).map((a, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500">
                          <Circle size={6} className={`${agent.color} fill-current shrink-0`} />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Automation flow */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
        <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-slate-600">Flujo de automatización</p>
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { label: 'Correo entra',    color: 'bg-slate-700 text-slate-300' },
            { arrow: true },
            { label: 'Agentes analizan', color: 'bg-violet-600/30 text-violet-300' },
            { arrow: true },
            { label: 'Clasifica',        color: 'bg-sky-600/20 text-sky-300' },
            { arrow: true },
            { label: 'Extrae tareas',    color: 'bg-amber-600/20 text-amber-300' },
            { arrow: true },
            { label: 'Actualiza CRM',    color: 'bg-emerald-600/20 text-emerald-300' },
            { arrow: true },
            { label: 'Tú decides',       color: 'bg-violet-600/40 text-violet-200 font-bold ring-1 ring-violet-500/40' },
          ].map((s, i) =>
            'arrow' in s ? (
              <ArrowRight key={i} size={12} className="text-slate-700 shrink-0" />
            ) : (
              <span key={i} className={`rounded-lg px-2 py-1 text-[10px] ${s.color}`}>{s.label}</span>
            )
          )}
        </div>
      </div>

      {/* Lead classification */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
        <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-slate-600">Un correo puede convertirse en</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            ['Lead', 'text-sky-300'],
            ['Idea', 'text-violet-300'],
            ['Proyecto', 'text-indigo-300'],
            ['Inversor', 'text-emerald-300'],
            ['Socio', 'text-amber-300'],
            ['Cliente', 'text-pink-300'],
          ].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-2">
              <FolderOpen size={10} className={color} />
              <span className={`text-xs font-semibold ${color}`}>{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-slate-600">Sin copiar y pegar información entre herramientas.</p>
      </div>
    </div>
  )
}

// ── Account View ───────────────────────────────────────────────────────────────

const APP_LABELS: Record<string, { label: string; color: string }> = {
  mylynk:  { label: 'MY-LYNK',  color: 'text-violet-300' },
  balance: { label: 'Balance',  color: 'text-cyan-300' },
  relay:   { label: 'Relay',    color: 'text-violet-400' },
  dare:    { label: 'DARE',     color: 'text-amber-300' },
  ai:      { label: 'AI',       color: 'text-sky-300' },
  files:   { label: 'Files',    color: 'text-emerald-300' },
}

function AccountView() {
  const { currentAccount, logout } = useMyLynkAuth()
  if (!currentAccount) return null

  const joined = new Date(currentAccount.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Profile card */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-indigo-600/5 p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 ring-2 ring-violet-400/30 text-2xl font-black text-white">
            {currentAccount.displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-bold text-white">{currentAccount.displayName}</p>
            <p className="text-xs text-slate-400">{currentAccount.email}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Miembro desde {joined}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span className="text-[11px] text-emerald-400">Cuenta MY-LYNK activa</span>
          <span className="ml-auto text-[10px] text-slate-600 font-mono">ID: {currentAccount.id}</span>
        </div>
      </div>

      {/* Connected apps */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={13} className="text-slate-500" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Apps conectadas
          </p>
          <span className="ml-auto text-[10px] text-slate-600">
            {currentAccount.connectedApps.length} de {Object.keys(APP_LABELS).length}
          </span>
        </div>
        <div className="space-y-2">
          {Object.entries(APP_LABELS).map(([id, { label, color }]) => {
            const connected = currentAccount.connectedApps.includes(id)
            return (
              <div key={id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${connected ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                <span className={`text-xs font-medium ${connected ? color : 'text-slate-600'}`}>{label}</span>
                <span className="ml-auto text-[10px] text-slate-700">
                  {connected ? 'Conectada' : 'Sin acceder'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sign out */}
      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
      >
        <LogOut size={14} />
        Cerrar sesión
      </button>
    </div>
  )
}
