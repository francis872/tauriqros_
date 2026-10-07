import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Network, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle,
  Briefcase, Landmark, ChevronLeft, Phone, Globe, FileText, Check,
} from 'lucide-react'
import { useMyLynkAuth, type AccountType, type RegisterExtra } from './mylynkAuthStore'

const DOMAIN = '@MY-LYNK.RB'

const APP_LABELS: Record<string, string> = {
  balance: 'Balance', relay: 'Relay', mylynk: 'MY-LYNK',
  dare: 'DARE', ai: 'AI', files: 'Files',
}

const AVATAR_COLORS = [
  '#6d28d9', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0d9488', '#ea580c',
]

const INDUSTRIES = [
  'Tecnología', 'Marketing', 'Salud', 'Educación', 'Finanzas',
  'Legal', 'Logística', 'Manufactura', 'Arte & Diseño', 'Otro',
]

const ACCOUNT_TYPES: { type: AccountType; label: string; desc: string; icon: React.ReactNode }[] = [
  { type: 'personal',     label: 'Personal',    desc: 'Cuenta individual para uso propio',  icon: <User size={20} /> },
  { type: 'business',     label: 'Empresa',      desc: 'Para negocios, marcas y equipos',    icon: <Briefcase size={20} /> },
  { type: 'organization', label: 'Organización', desc: 'ONGs, instituciones y comunidades',  icon: <Landmark size={20} /> },
]

const TYPE_COLORS: Record<AccountType, { ring: string; bg: string; text: string; glow: string }> = {
  personal:     { ring: 'ring-violet-500', bg: 'bg-violet-600', text: 'text-violet-300', glow: 'bg-violet-600/20' },
  business:     { ring: 'ring-amber-500',  bg: 'bg-amber-500',  text: 'text-amber-300',  glow: 'bg-amber-500/20'  },
  organization: { ring: 'ring-teal-500',   bg: 'bg-teal-500',   text: 'text-teal-300',   glow: 'bg-teal-500/20'   },
}

interface Props { appId: string }

type Mode = 'login' | 'register'

export default function MyLynkSignIn({ appId }: Props) {
  const { login, register } = useMyLynkAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [step, setStep] = useState<1 | 2>(1)
  const [accountType, setAccountType] = useState<AccountType>('personal')
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0])
  const [displayName, setDisplayName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const appLabel = APP_LABELS[appId] ?? appId
  const tc = TYPE_COLORS[accountType]
  const resolvedDisplayName = accountType === 'personal' ? displayName : companyName

  function handleSubmit() {
    setError(null)
    setLoading(true)
    let result: { ok: boolean; error?: string }
    if (mode === 'login') {
      result = login(username, password)
    } else {
      const extra: RegisterExtra = {
        accountType, avatarColor,
        bio: bio || undefined, phone: phone || undefined,
        industry: industry || undefined, website: website || undefined,
        companyName: accountType !== 'personal' ? companyName : undefined,
      }
      result = register(resolvedDisplayName, username, password, extra)
    }
    setLoading(false)
    if (!result.ok) setError(result.error ?? 'Error desconocido')
  }

  function switchMode(next: Mode) {
    setMode(next); setStep(1); setError(null)
    setDisplayName(''); setCompanyName(''); setUsername(''); setPassword('')
    setBio(''); setPhone(''); setIndustry(''); setWebsite('')
    setAccountType('personal'); setAvatarColor(AVATAR_COLORS[0])
  }

  const canSubmit = mode === 'login'
    ? username.trim().length > 0 && password.length >= 1
    : username.trim().length > 0 && password.length >= 6 && resolvedDisplayName.trim().length > 0

  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#0b0b12] px-4 overflow-y-auto py-6">
      {/* Background glow — color changes with account type */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full blur-[120px] transition-colors duration-500 ${tc.glow}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-sm"
      >
        {/* Branding */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tc.bg} ring-2 ${tc.ring}/30 shadow-lg transition-colors duration-300`}>
            <Network size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-black tracking-[0.2em] text-white uppercase">MY-LYNK</h1>
          <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1">
            <span className="text-[10px] font-mono text-violet-300">correos</span>
            <span className="text-[10px] font-bold text-violet-200">{DOMAIN}</span>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            {mode === 'login' ? `Inicia sesión para acceder a ${appLabel}`
              : step === 1 ? 'Elige el tipo de cuenta que mejor te describe'
              : `Crea tu dirección ${DOMAIN}`}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-5 flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => switchMode(m)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                mode === m ? 'bg-violet-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
              }`}>
              {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── LOGIN ─── */}
          {mode === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
              <MLField label="Usuario" icon={<User size={13} />}>
                <input value={username} onChange={e => setUsername(e.target.value.replace(/[@\s]/g, '').toLowerCase())}
                  placeholder="tu.usuario" aria-label="Nombre de usuario" autoComplete="username"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
                <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">{DOMAIN}</span>
              </MLField>
              <MLField label="Contraseña" icon={<Lock size={13} />}>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña"
                  aria-label="Contraseña" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
                <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Ocultar' : 'Mostrar'}
                  className="text-slate-600 hover:text-slate-400 transition flex-shrink-0">
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </MLField>
              <MLError error={error} />
              <MLSubmit loading={loading} disabled={!canSubmit} label="Entrar" onClick={handleSubmit} bg={tc.bg} />
            </motion.div>
          )}

          {/* ─── REGISTER STEP 1: TIPO DE CUENTA ─── */}
          {mode === 'register' && step === 1 && (
            <motion.div key="reg-step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {ACCOUNT_TYPES.map(({ type, label, desc, icon }) => {
                  const colors = TYPE_COLORS[type]
                  const sel = accountType === type
                  return (
                    <button key={type} type="button" onClick={() => setAccountType(type)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                        sel ? `${colors.ring} border-current bg-white/[0.04]` : 'border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.03]'
                      }`}>
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition ${sel ? `${colors.bg} text-white` : 'bg-slate-800 text-slate-500'}`}>
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold transition ${sel ? 'text-white' : 'text-slate-400'}`}>{label}</p>
                        <p className="text-[10px] text-slate-600 leading-tight mt-0.5">{desc}</p>
                      </div>
                      {sel && <Check size={14} className={`ml-auto flex-shrink-0 ${colors.text}`} />}
                    </button>
                  )
                })}
              </div>

              {/* Color picker */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Color de perfil</p>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setAvatarColor(color)}
                      className={`h-6 w-6 rounded-full border-2 transition ${avatarColor === color ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-90'}`}
                      style={{ backgroundColor: color }} aria-label={color} />
                  ))}
                </div>
              </div>

              <button type="button" onClick={() => { setError(null); setStep(2) }}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition ${tc.bg} hover:opacity-90`}>
                Continuar <ArrowRight size={14} />
              </button>
            </motion.div>
          )}

          {/* ─── REGISTER STEP 2: DATOS ─── */}
          {mode === 'register' && step === 2 && (
            <motion.div key="reg-step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
              {/* Back */}
              <button type="button" onClick={() => { setStep(1); setError(null) }}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition">
                <ChevronLeft size={12} /> Cambiar tipo ·
                <span className={`ml-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${tc.bg} text-white`}>
                  {ACCOUNT_TYPES.find(t => t.type === accountType)?.label}
                </span>
              </button>

              {/* Preview card */}
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow"
                  style={{ backgroundColor: avatarColor }}>
                  {(resolvedDisplayName || 'T').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-300 truncate">{resolvedDisplayName || 'Tu nombre'}</p>
                  <p className="text-[10px] text-slate-600 font-mono truncate">{username ? username + DOMAIN : DOMAIN}</p>
                </div>
              </div>

              {/* Name field */}
              {accountType === 'personal' ? (
                <MLField label="Nombre completo" icon={<User size={13} />}>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tu nombre completo"
                    aria-label="Nombre completo" autoComplete="name"
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
                </MLField>
              ) : (
                <MLField label={accountType === 'business' ? 'Nombre de la empresa' : 'Nombre de la organización'} icon={<Briefcase size={13} />}>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder={accountType === 'business' ? 'Ej: Acme Corp' : 'Ej: Fundación Salud'}
                    aria-label="Nombre" autoComplete="organization"
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
                </MLField>
              )}

              {/* Username */}
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Nombre de usuario</p>
                <div className="flex items-center rounded-xl border border-white/[0.08] bg-slate-800/60 focus-within:border-violet-500/50 overflow-hidden">
                  <input value={username} onChange={e => setUsername(e.target.value.replace(/[@\s]/g, '').toLowerCase())}
                    placeholder={accountType === 'personal' ? 'tu.usuario' : accountType === 'business' ? 'mi.empresa' : 'mi.org'}
                    aria-label="Nombre de usuario" autoComplete="username"
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none min-w-0" />
                  <span className={`flex-shrink-0 border-l border-white/[0.06] px-2.5 py-2.5 font-mono text-[11px] font-bold whitespace-nowrap ${tc.text}`}
                    style={{ backgroundColor: `${avatarColor}22` }}>{DOMAIN}</span>
                </div>
                {username.length > 0 && (
                  <p className="mt-1 font-mono text-[10px] text-slate-600 pl-1">{username}{DOMAIN}</p>
                )}
              </div>

              {/* Password */}
              <MLField label="Contraseña" icon={<Lock size={13} />}>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                  aria-label="Contraseña" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
                <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Ocultar' : 'Mostrar'}
                  className="text-slate-600 hover:text-slate-400 transition flex-shrink-0">
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </MLField>

              {/* Personal extras */}
              {accountType === 'personal' && (
                <>
                  <MLField label="Bio (opcional)" icon={<FileText size={13} />}>
                    <input value={bio} onChange={e => setBio(e.target.value)} placeholder="Una frase sobre ti"
                      aria-label="Bio" autoComplete="off"
                      className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
                  </MLField>
                  <MLField label="Teléfono (opcional)" icon={<Phone size={13} />}>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000"
                      aria-label="Teléfono" type="tel" autoComplete="tel"
                      className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
                  </MLField>
                </>
              )}

              {/* Business / Organization extras */}
              {(accountType === 'business' || accountType === 'organization') && (
                <>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {accountType === 'business' ? 'Industria' : 'Categoría'}
                    </p>
                    <select value={industry} onChange={e => setIndustry(e.target.value)} aria-label="Industria"
                      className="w-full rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50">
                      <option value="">Seleccionar...</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <MLField label="Sitio web (opcional)" icon={<Globe size={13} />}>
                    <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://ejemplo.com"
                      aria-label="Sitio web" type="url" autoComplete="url"
                      className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
                  </MLField>
                </>
              )}

              <MLError error={error} />
              <MLSubmit loading={loading} disabled={!canSubmit} label="Crear cuenta" onClick={handleSubmit} bg={tc.bg} />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-5 text-center text-[10px] text-slate-700">Cuenta local · solo en este dispositivo</p>
      </motion.div>
    </div>
  )
}

// ── Shared mini-components ────────────────────────────────────────────────────

function MLField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2.5 focus-within:border-violet-500/50">
        <span className="text-slate-500 flex-shrink-0">{icon}</span>
        {children}
      </div>
    </div>
  )
}

function MLError({ error }: { error: string | null }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2">
          <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MLSubmit({ loading, disabled, label, onClick, bg }:
  { loading: boolean; disabled: boolean; label: string; onClick: () => void; bg: string }) {
  return (
    <button type="button" onClick={onClick} disabled={loading || disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition ${bg} hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed`}>
      {loading
        ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        : <>{label} <ArrowRight size={14} /></>}
    </button>
  )
}
