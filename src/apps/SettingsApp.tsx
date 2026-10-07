import { useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Palette, Shield, Cpu, Network, User, ChevronRight } from 'lucide-react'

const SETTINGS_SECTIONS = [
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'system', icon: Cpu, label: 'System' },
  { id: 'network', icon: Network, label: 'Network' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'display', icon: Monitor, label: 'Display' },
  { id: 'profile', icon: User, label: 'Profile' },
]

const ACCENT_OPTIONS = [
  { label: 'Electric Blue', value: 'blue', bg: 'bg-sky-500' },
  { label: 'Violet', value: 'violet', bg: 'bg-violet-500' },
  { label: 'Cyan', value: 'cyan', bg: 'bg-cyan-500' },
  { label: 'Emerald', value: 'green', bg: 'bg-emerald-500' },
]

export default function SettingsApp(_: { windowId: string }) {
  const [activeSection, setActiveSection] = useState('appearance')
  const [accent, setAccent] = useState('blue')
  const [animations, setAnimations] = useState(true)
  const [blur, setBlur] = useState(true)
  const [grid, setGrid] = useState(true)

  return (
    <div className="flex h-full text-slate-300">
      {/* Sidebar */}
      <div className="w-44 border-r border-white/[0.06] p-2 flex flex-col gap-1 shrink-0">
        <p className="text-[9px] font-mono text-slate-600 tracking-widest mb-2 px-2">SETTINGS</p>
        {SETTINGS_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all ${
              activeSection === s.id
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
            }`}
          >
            <s.icon size={12} />
            <span>{s.label}</span>
            {activeSection === s.id && <ChevronRight size={10} className="ml-auto" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSection === 'appearance' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Accent Color</h3>
              <p className="text-xs text-slate-600 mb-3">Sets the primary interface color</p>
              <div className="flex gap-3">
                {ACCENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAccent(opt.value)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className={`w-8 h-8 rounded-full ${opt.bg} border-2 transition-all ${
                      accent === opt.value ? 'border-white scale-110' : 'border-transparent opacity-60'
                    }`} />
                    <span className="text-[9px] text-slate-600">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Animations', desc: 'Enable motion and transitions', state: animations, set: setAnimations },
                { label: 'Glass blur', desc: 'Backdrop blur effects on panels', state: blur, set: setBlur },
                { label: 'Grid overlay', desc: 'Show desktop grid pattern', state: grid, set: setGrid },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                  <div>
                    <p className="text-sm text-slate-300">{item.label}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => item.set(!item.state)}
                    className={`w-10 h-5 rounded-full transition-all relative ${item.state ? 'bg-sky-500' : 'bg-white/[0.08]'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${item.state ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === 'system' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">System Information</h3>
            {[
              { label: 'OS Version', value: 'TAURIQ OS v0.1.0-alpha' },
              { label: 'Build', value: '2026.05.27-dev' },
              { label: 'Runtime', value: 'Tauri + Vite' },
              { label: 'AI Engine', value: 'Neural Bridge v0.1 (standby)' },
              { label: 'Architecture', value: 'AI-Native Desktop Environment' },
            ].map(item => (
              <div key={item.label} className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-xs font-mono text-slate-300">{item.value}</span>
              </div>
            ))}
          </motion.div>
        )}

        {['network', 'security', 'display', 'profile'].includes(activeSection) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center">
              <p className="text-xs font-mono text-slate-700">
                {activeSection} settings — coming in Phase 2
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
