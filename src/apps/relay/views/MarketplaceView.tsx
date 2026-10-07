import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Star } from 'lucide-react'

interface Template {
  id: string
  name: string
  category: string
  description: string
  icon: string
  stars: number
  installs: number
  tags: string[]
  premium: boolean
}

const TEMPLATES: Template[] = [
  { id: '1', name: 'SDR Sales Pipeline', category: 'Sales', description: 'Pipeline completo de ventas SDR con calificación automática de leads, seguimiento y cierre inteligente.', icon: '💼', stars: 4.9, installs: 2841, tags: ['leads', 'crm', 'email'], premium: false },
  { id: '2', name: 'Support Auto-Resolution', category: 'Support', description: 'Resuelve automáticamente tickets de soporte nivel 1 y 2 con escalación inteligente.', icon: '🎧', stars: 4.8, installs: 3219, tags: ['tickets', 'helpdesk', 'escalation'], premium: false },
  { id: '3', name: 'Real Estate Assistant', category: 'Real Estate', description: 'Agente inmobiliario virtual con recorridos virtuales, seguimiento de clientes y automatización comercial.', icon: '🏡', stars: 4.7, installs: 1102, tags: ['crm', 'tours', 'follow-up'], premium: true },
  { id: '4', name: 'E-commerce Recovery', category: 'Ecommerce', description: 'Recupera carritos abandonados, optimiza conversión y automatiza soporte post-venta.', icon: '🛒', stars: 4.6, installs: 1874, tags: ['cart', 'email', 'conversion'], premium: false },
  { id: '5', name: 'Weekly Analytics Engine', category: 'Analytics', description: 'Genera reportes semanales automatizados con insights de negocio y distribución a stakeholders.', icon: '📊', stars: 4.8, installs: 987, tags: ['reports', 'kpis', 'email'], premium: false },
  { id: '6', name: 'Marketing Campaign Orchestrator', category: 'Marketing', description: 'Diseña, lanza y optimiza campañas de marketing con IA multicanal y análisis de rendimiento.', icon: '📣', stars: 4.5, installs: 763, tags: ['campaigns', 'social', 'analytics'], premium: true },
  { id: '7', name: 'HR Onboarding Suite', category: 'HR', description: 'Automatiza onboarding de empleados, gestión de documentos y primera semana de incorporación.', icon: '👥', stars: 4.7, installs: 542, tags: ['hr', 'docs', 'workflows'], premium: true },
  { id: '8', name: 'Voice SDR Dialer', category: 'Sales', description: 'Agente de voz que realiza llamadas de prospección, califica leads en tiempo real y agenda demos.', icon: '📞', stars: 4.6, installs: 431, tags: ['voice', 'calls', 'crm'], premium: true },
  { id: '9', name: 'Contract Intelligence', category: 'Legal', description: 'Analiza contratos, extrae cláusulas clave, detecta riesgos y genera resúmenes ejecutivos.', icon: '📋', stars: 4.9, installs: 328, tags: ['docs', 'vision', 'legal'], premium: true },
]

const CATEGORIES = ['All', 'Sales', 'Support', 'Ecommerce', 'Analytics', 'Marketing', 'Real Estate', 'HR', 'Legal']

export default function MarketplaceView() {
  const [category, setCategory] = useState('All')
  const [installed, setInstalled] = useState<Set<string>>(new Set(['1', '2']))
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = category === 'All' || t.category === category
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.tags.some((tag) => tag.includes(searchQuery.toLowerCase()))
    return matchCat && matchSearch
  })

  function install(id: string) {
    setInstalled((prev) => new Set([...prev, id]))
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-5 min-h-0">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-sm font-bold text-white">Agent Marketplace</h2>
        <p className="text-xs text-slate-500 mt-0.5">Pre-built agents & workflow templates</p>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="search"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          title="Search templates"
          aria-label="Search templates"
          className="flex-1 rounded-xl border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none"
        />
      </div>

      <div className="flex gap-1.5 mb-5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${category === cat ? 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30' : 'text-slate-600 hover:text-slate-400 hover:bg-white/[0.03]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((t) => {
          const isInstalled = installed.has(t.id)
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4 flex flex-col gap-3 hover:border-violet-500/20 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-200">{t.name}</p>
                      {t.premium && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">PRO</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5">{t.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-amber-400">
                  <Star size={10} className="fill-amber-400" />
                  {t.stars}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">{t.description}</p>

              <div className="flex flex-wrap gap-1">
                {t.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-white/[0.06] bg-zinc-800/60 px-1.5 py-0.5 text-[9px] text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <span className="text-[10px] text-slate-700">{t.installs.toLocaleString()} installs</span>
                <button
                  type="button"
                  onClick={() => install(t.id)}
                  disabled={isInstalled}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${isInstalled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-violet-600 text-white hover:bg-violet-500'}`}
                >
                  <Download size={10} />
                  {isInstalled ? 'Installed' : 'Install'}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
