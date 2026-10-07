import { writeFileSync, mkdirSync } from 'fs';

// ─── index.css ───────────────────────────────────────────────────────────────
const indexCss = `/* TAURIQ OS — Global Stylesheet */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
  body { background-color: #0a0a0f; color: #e2e8f0; font-family: Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1a1a28; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: #0ea5e9; }
}

@layer components {
  .glass { background: rgba(13,13,20,0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.06); }
  .glass-panel { background: rgba(17,17,24,0.8); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.07); }
  .tauriq-btn { @apply flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 transition-all duration-200 hover:bg-white/[0.06] cursor-pointer select-none; }
  .tauriq-btn-primary { @apply flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all duration-200 cursor-pointer select-none; }
  .glow-text { text-shadow: 0 0 24px rgba(14,165,233,0.6); }
  .widget-card { @apply glass-panel rounded-2xl p-4 border border-white/[0.07] hover:border-sky-500/20 transition-all duration-300; }
}

@layer utilities {
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .text-gradient { background: linear-gradient(135deg, #0ea5e9, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .bg-grid { background-image: linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px); background-size: 32px 32px; }
}
`;

// ─── App.css (empty - using Tailwind) ────────────────────────────────────────
const appCss = `/* TAURIQ OS — App Styles (Tailwind handles everything) */\n`;

// ─── main.tsx ─────────────────────────────────────────────────────────────────
const mainTsx = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`;

// ─── App.tsx ──────────────────────────────────────────────────────────────────
const appTsx = `import { useState, useEffect } from 'react'
import BootScreen from './components/BootScreen'
import Desktop from './layouts/Desktop'

type AppPhase = 'boot' | 'desktop'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('boot')

  useEffect(() => {
    const timer = setTimeout(() => setPhase('desktop'), 3800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full h-full bg-[#0a0a0f] overflow-hidden">
      {phase === 'boot' && <BootScreen onComplete={() => setPhase('desktop')} />}
      {phase === 'desktop' && <Desktop />}
    </div>
  )
}
`;

// ─── utils/cn.ts ──────────────────────────────────────────────────────────────
const cnUtil = `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;

// ─── hooks/useSystemTime.ts ───────────────────────────────────────────────────
const useSystemTime = `import { useState, useEffect } from 'react'

export function useSystemTime() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')
  const date = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return { time, hours, minutes, seconds, date, formatted: \`\${hours}:\${minutes}\` }
}
`;

// ─── hooks/useSystemStats.ts ──────────────────────────────────────────────────
const useSystemStats = `import { useState, useEffect } from 'react'

interface SystemStats {
  cpu: number
  memory: number
  network: 'online' | 'offline'
  aiActivity: number
}

export function useSystemStats(): SystemStats {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    network: 'online',
    aiActivity: 0,
  })

  useEffect(() => {
    const update = () => {
      setStats({
        cpu: Math.floor(20 + Math.random() * 60),
        memory: Math.floor(40 + Math.random() * 30),
        network: navigator.onLine ? 'online' : 'offline',
        aiActivity: Math.floor(Math.random() * 100),
      })
    }
    update()
    const id = setInterval(update, 2000)
    return () => clearInterval(id)
  }, [])

  return stats
}
`;

// ─── animations/variants.ts ───────────────────────────────────────────────────
const variants = `import type { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}
`;

// ─── components/BootScreen.tsx ────────────────────────────────────────────────
const bootScreen = `import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootScreenProps {
  onComplete: () => void
}

const bootMessages = [
  'Initializing TAURIQ kernel...',
  'Loading AI subsystems...',
  'Mounting filesystem...',
  'Starting neural bridge...',
  'Launching environment...',
]

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + Math.random() * 18 + 6, 100)
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setExiting(true)
            setTimeout(onComplete, 600)
          }, 400)
        }
        return next
      })
      setMsgIndex(i => (i + 1) % bootMessages.length)
    }, 500)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center z-50 bg-grid"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.06)_0%,transparent_70%)]" />
          
          {/* Logo area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative flex flex-col items-center gap-6 mb-16"
          >
            {/* Hexagonal logo mark */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 relative"
            >
              <div className="absolute inset-0 rounded-full border border-sky-500/20" />
              <div className="absolute inset-2 rounded-full border border-sky-500/30" />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-4 rounded-full bg-sky-500/10 border border-sky-400/40 flex items-center justify-center"
              >
                <span className="text-sky-400 font-mono font-bold text-lg glow-text">T</span>
              </motion.div>
            </motion.div>

            {/* Brand name */}
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-[0.3em] text-white font-mono glow-text">
                TAURIQ
              </h1>
              <p className="text-sky-400/60 text-xs tracking-[0.5em] font-mono mt-2">
                AI-NATIVE OPERATING ENVIRONMENT
              </p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-80 flex flex-col gap-3"
          >
            <div className="h-px bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full"
                style={{ width: \`\${progress}%\` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-slate-500">
                {bootMessages[msgIndex]}
              </p>
              <span className="text-xs font-mono text-sky-500/60">
                {Math.floor(progress)}%
              </span>
            </div>
          </motion.div>

          {/* Version tag */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-xs font-mono text-slate-700"
          >
            TAURIQ OS v0.1.0-alpha
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
`;

// ─── components/Sidebar.tsx ───────────────────────────────────────────────────
const sidebar = `import { motion } from 'framer-motion'
import { Home, Briefcase, Cpu, FolderOpen, Terminal, Settings, Zap } from 'lucide-react'
import { cn } from '../utils/cn'
import { slideInLeft } from '../animations/variants'

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'workspace', icon: Briefcase, label: 'Workspace' },
  { id: 'ai', icon: Zap, label: 'AI' },
  { id: 'files', icon: FolderOpen, label: 'Files' },
  { id: 'terminal', icon: Terminal, label: 'Terminal' },
] as const

const BOTTOM_ITEMS = [
  { id: 'settings', icon: Settings, label: 'Settings' },
] as const

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <motion.aside
      variants={slideInLeft}
      initial="hidden"
      animate="visible"
      className="w-14 h-full glass-panel border-r border-white/[0.06] flex flex-col items-center py-4 gap-1 z-10"
    >
      {/* Logo mark */}
      <div className="mb-4">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border border-sky-500/30 flex items-center justify-center"
        >
          <span className="text-sky-400 text-xs font-bold font-mono glow-text">T</span>
        </motion.div>
      </div>

      <div className="flex flex-col gap-1 flex-1 w-full px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={item.label}
              className={cn(
                'relative w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-200 group',
                isActive
                  ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]'
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute right-0 w-0.5 h-5 bg-sky-400 rounded-l-full"
                />
              )}
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-2 py-1 bg-[#111118] border border-white/10 rounded text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono z-50">
                {item.label}
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="flex flex-col gap-1 w-full px-2">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={item.label}
              className="w-full aspect-square rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all duration-200"
            >
              <Icon size={16} strokeWidth={1.5} />
            </motion.button>
          )
        })}

        {/* Avatar */}
        <div className="mt-2 w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
          T
        </div>
      </div>
    </motion.aside>
  )
}
`;

// ─── components/TopBar.tsx ────────────────────────────────────────────────────
const topBar = `import { motion } from 'framer-motion'
import { Search, Wifi, WifiOff, Circle } from 'lucide-react'
import { useSystemTime } from '../hooks/useSystemTime'
import { useSystemStats } from '../hooks/useSystemStats'
import { fadeIn } from '../animations/variants'

interface TopBarProps {
  onSearchOpen: () => void
}

export default function TopBar({ onSearchOpen }: TopBarProps) {
  const { formatted, date } = useSystemTime()
  const { network } = useSystemStats()

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-10 w-full glass-panel border-b border-white/[0.05] flex items-center px-4 gap-4 z-10 shrink-0"
    >
      {/* Left: breadcrumb / workspace */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs font-mono text-slate-600">TAURIQ OS</span>
        <span className="text-slate-700 text-xs">/</span>
        <span className="text-xs font-mono text-sky-500/70">workspace</span>
      </div>

      {/* Center: Search */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSearchOpen}
        className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-sky-500/20 transition-all duration-200 text-xs font-mono"
      >
        <Search size={11} />
        <span>Search...</span>
        <kbd className="ml-2 px-1 py-px bg-white/[0.06] rounded text-[10px] text-slate-600">⌘K</kbd>
      </motion.button>

      {/* Right: status indicators */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Network */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {network === 'online' ? (
            <>
              <Wifi size={11} className="text-emerald-400" />
              <span className="text-emerald-400/70">online</span>
            </>
          ) : (
            <>
              <WifiOff size={11} className="text-red-400" />
              <span className="text-red-400/70">offline</span>
            </>
          )}
        </div>

        {/* AI status dot */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Circle size={6} className="fill-sky-400 text-sky-400" />
          </motion.div>
          <span className="text-sky-400/60">AI ready</span>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">{date}</span>
          <span className="text-white font-semibold tracking-wider">{formatted}</span>
        </div>
      </div>
    </motion.header>
  )
}
`;

// ─── components/AICommandCenter.tsx ───────────────────────────────────────────
const aiCommandCenter = `import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Send, Command, X } from 'lucide-react'
import { cn } from '../utils/cn'
import { scaleIn } from '../animations/variants'

interface Message {
  id: string
  type: 'user' | 'ai' | 'system'
  text: string
  timestamp: Date
}

const SUGGESTIONS = [
  'Open terminal',
  'Show system stats',
  'Create new workspace',
  'Search files',
  'Run automation script',
]

const AI_RESPONSES: Record<string, string> = {
  default: 'Command acknowledged. AI subsystems are in standby mode — full integration coming in the next build.',
}

export default function AICommandCenter() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', type: 'system', text: 'TAURIQ AI v0.1 — Neural bridge initialized. Type a command or ask anything.', timestamp: new Date() },
  ])
  const [isThinking, setIsThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = { id: Date.now().toString(), type: 'user', text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsThinking(true)

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: AI_RESPONSES.default,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
      setIsThinking(false)
    }, 900)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full widget-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <Zap size={14} className="text-sky-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white font-mono tracking-wide">AI Command Center</h3>
          <p className="text-[10px] text-slate-600">Neural bridge ready</p>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'text-xs font-mono rounded-lg px-3 py-2',
                msg.type === 'user' && 'bg-sky-500/10 border border-sky-500/20 text-sky-300 ml-4',
                msg.type === 'ai' && 'bg-white/[0.03] border border-white/[0.06] text-slate-300',
                msg.type === 'system' && 'text-slate-600 text-[10px] italic'
              )}
            >
              {msg.type === 'user' && <span className="text-sky-500/60 mr-1">{'>'}</span>}
              {msg.type === 'ai' && <span className="text-violet-400/60 mr-1">AI</span>}
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-2"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-sky-400"
              />
            ))}
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="flex gap-1.5 flex-wrap mt-3 mb-2">
        {SUGGESTIONS.slice(0, 3).map(s => (
          <button
            key={s}
            onClick={() => setInput(s)}
            className="text-[10px] font-mono px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-sky-500/20 transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 hover:border-sky-500/20 transition-all focus-within:border-sky-500/30">
        <Command size={12} className="text-slate-600 shrink-0" />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask AI or type a command..."
          className="flex-1 bg-transparent text-xs font-mono text-slate-200 placeholder:text-slate-700 outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={sendMessage}
          disabled={!input.trim()}
          className="text-sky-500 hover:text-sky-400 disabled:text-slate-700 transition-colors"
        >
          <Send size={12} />
        </motion.button>
      </div>
    </motion.div>
  )
}
`;

// ─── widgets/CPUWidget.tsx ────────────────────────────────────────────────────
const cpuWidget = `import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import { useSystemStats } from '../hooks/useSystemStats'
import { cn } from '../utils/cn'

export default function CPUWidget() {
  const { cpu } = useSystemStats()
  const bars = Array.from({ length: 12 })

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-sky-400" />
          <span className="text-xs font-mono text-slate-400">CPU</span>
        </div>
        <span className={cn(
          'text-sm font-bold font-mono',
          cpu > 80 ? 'text-red-400' : cpu > 60 ? 'text-amber-400' : 'text-sky-400'
        )}>
          {cpu}%
        </span>
      </div>
      {/* Bar graph */}
      <div className="flex items-end gap-0.5 h-10">
        {bars.map((_, i) => {
          const height = Math.random() * 80 + 20
          const active = (i / bars.length) * 100 <= cpu
          return (
            <motion.div
              key={i}
              animate={{ height: \`\${height}%\` }}
              transition={{ duration: 0.8, delay: i * 0.03, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              className={cn(
                'flex-1 rounded-sm transition-colors duration-500',
                active ? 'bg-sky-500/60' : 'bg-white/[0.05]'
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
`;

// ─── widgets/MemoryWidget.tsx ──────────────────────────────────────────────────
const memoryWidget = `import { motion } from 'framer-motion'
import { Database } from 'lucide-react'
import { useSystemStats } from '../hooks/useSystemStats'
import { cn } from '../utils/cn'

export default function MemoryWidget() {
  const { memory } = useSystemStats()

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-violet-400" />
          <span className="text-xs font-mono text-slate-400">Memory</span>
        </div>
        <span className={cn(
          'text-sm font-bold font-mono',
          memory > 80 ? 'text-red-400' : memory > 60 ? 'text-amber-400' : 'text-violet-400'
        )}>
          {memory}%
        </span>
      </div>

      {/* Radial progress */}
      <div className="relative w-16 h-16 mx-auto">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <motion.circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke="url(#memGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={100.5}
            animate={{ strokeDashoffset: 100.5 - (100.5 * memory) / 100 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="memGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-mono text-slate-400">{memory}%</span>
        </div>
      </div>
    </div>
  )
}
`;

// ─── widgets/AIActivityWidget.tsx ─────────────────────────────────────────────
const aiActivityWidget = `import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { useSystemStats } from '../hooks/useSystemStats'

export default function AIActivityWidget() {
  const { aiActivity } = useSystemStats()
  const pulses = Array.from({ length: 20 })

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-emerald-400" />
          <span className="text-xs font-mono text-slate-400">AI Activity</span>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-1"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-mono text-emerald-400/70">active</span>
        </motion.div>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-px h-10 overflow-hidden">
        {pulses.map((_, i) => {
          const h = Math.random() * 70 + 15
          return (
            <motion.div
              key={i}
              animate={{ scaleY: [0.3, 1, 0.3] }}
              transition={{
                duration: 0.8 + Math.random() * 0.8,
                delay: i * 0.05,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ height: \`\${h}%\` }}
              className="flex-1 rounded-sm bg-emerald-500/40 origin-center"
            />
          )
        })}
      </div>
    </div>
  )
}
`;

// ─── widgets/NotesWidget.tsx ───────────────────────────────────────────────────
const notesWidget = `import { useState } from 'react'
import { motion } from 'framer-motion'
import { StickyNote, Plus } from 'lucide-react'

export default function NotesWidget() {
  const [notes, setNotes] = useState(['Design AI pipeline', 'Review widget architecture'])
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const addNote = () => {
    if (draft.trim()) {
      setNotes(prev => [draft.trim(), ...prev])
    }
    setDraft('')
    setAdding(false)
  }

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote size={13} className="text-amber-400" />
          <span className="text-xs font-mono text-slate-400">Notes</span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
        >
          <Plus size={11} />
        </button>
      </div>

      {adding && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addNote(); if (e.key === 'Escape') setAdding(false) }}
            onBlur={addNote}
            placeholder="New note..."
            className="w-full bg-white/[0.04] border border-amber-500/20 rounded px-2 py-1 text-xs font-mono text-slate-300 placeholder:text-slate-700 outline-none"
          />
        </motion.div>
      )}

      <div className="space-y-1.5">
        {notes.slice(0, 3).map((note, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 text-xs font-mono text-slate-500 group"
          >
            <div className="w-1 h-1 rounded-full bg-amber-500/50 shrink-0" />
            <span className="truncate">{note}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
`;

// ─── widgets/WorkspaceWidget.tsx ────────────────────────────────────────────────
const workspaceWidget = `import { motion } from 'framer-motion'
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
            <div className={\`w-1.5 h-1.5 rounded-full \${statusColors[p.status as keyof typeof statusColors]}\`} />
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
`;

// ─── components/TerminalWindow.tsx ────────────────────────────────────────────
const terminalWindow = `import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal, X, Minus, Square } from 'lucide-react'
import { scaleIn } from '../animations/variants'

interface TerminalLine {
  id: string
  type: 'input' | 'output' | 'error' | 'system'
  content: string
}

const COMMANDS: Record<string, string> = {
  help: 'Available: help, clear, whoami, uname, date, echo <text>',
  whoami: 'tauriq-user',
  uname: 'TAURIQ OS v0.1.0-alpha (AI-Native)',
  date: new Date().toUTCString(),
  pwd: '/home/tauriq',
  ls: 'Desktop  Documents  Downloads  Projects  .tauriq',
}

export default function TerminalWindow() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '0', type: 'system', content: '⬡ TAURIQ Terminal v0.1 — type "help" for commands' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const execute = (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    setHistory(h => [trimmed, ...h.slice(0, 49)])
    setHistoryIdx(-1)

    const inputLine: TerminalLine = { id: Date.now().toString(), type: 'input', content: trimmed }

    let output: TerminalLine

    if (trimmed === 'clear') {
      setLines([{ id: Date.now().toString(), type: 'system', content: '⬡ TAURIQ Terminal v0.1 — cleared' }])
      return
    } else if (trimmed.startsWith('echo ')) {
      output = { id: (Date.now() + 1).toString(), type: 'output', content: trimmed.slice(5) }
    } else if (COMMANDS[trimmed]) {
      output = { id: (Date.now() + 1).toString(), type: 'output', content: COMMANDS[trimmed] }
    } else {
      output = { id: (Date.now() + 1).toString(), type: 'error', content: \`tauriq: command not found: \${trimmed}\` }
    }

    setLines(prev => [...prev, inputLine, output])
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execute(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(historyIdx + 1, history.length - 1)
      setHistoryIdx(idx)
      setInput(history[idx] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(historyIdx - 1, -1)
      setHistoryIdx(idx)
      setInput(idx === -1 ? '' : history[idx])
    }
  }

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden border border-white/[0.07]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02] shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60 hover:bg-amber-500 transition-colors cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60 hover:bg-emerald-500 transition-colors cursor-pointer" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 text-xs font-mono text-slate-600">
          <Terminal size={11} />
          <span>tauriq — bash</span>
        </div>
      </div>

      {/* Terminal body */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 font-mono text-xs">
        {lines.map(line => (
          <div key={line.id} className="mb-1 leading-relaxed">
            {line.type === 'input' && (
              <span>
                <span className="text-sky-500">tauriq</span>
                <span className="text-slate-600">@os</span>
                <span className="text-slate-700">:</span>
                <span className="text-violet-400">~</span>
                <span className="text-slate-600"> $ </span>
                <span className="text-white">{line.content}</span>
              </span>
            )}
            {line.type === 'output' && <span className="text-slate-300">{line.content}</span>}
            {line.type === 'error' && <span className="text-red-400">{line.content}</span>}
            {line.type === 'system' && <span className="text-sky-500/60">{line.content}</span>}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex items-center">
          <span className="text-sky-500">tauriq</span>
          <span className="text-slate-600">@os</span>
          <span className="text-slate-700">:</span>
          <span className="text-violet-400">~</span>
          <span className="text-slate-600"> $ </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-white outline-none caret-sky-400"
            autoComplete="off"
            spellCheck={false}
          />
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-4 bg-sky-400/80 rounded-sm ml-0.5"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </motion.div>
  )
}
`;

// ─── layouts/Desktop.tsx ──────────────────────────────────────────────────────
const desktop = `import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import AICommandCenter from '../components/AICommandCenter'
import CPUWidget from '../widgets/CPUWidget'
import MemoryWidget from '../widgets/MemoryWidget'
import AIActivityWidget from '../widgets/AIActivityWidget'
import NotesWidget from '../widgets/NotesWidget'
import WorkspaceWidget from '../widgets/WorkspaceWidget'
import TerminalWindow from '../components/TerminalWindow'
import { containerVariants, fadeInUp } from '../animations/variants'

export default function Desktop() {
  const [activeView, setActiveView] = useState('home')
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full flex bg-[#0a0a0f] overflow-hidden"
    >
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.04),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(124,58,237,0.03),transparent)]" />
        <div className="absolute inset-0 bg-grid opacity-60" />
      </div>

      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <TopBar onSearchOpen={() => setSearchOpen(true)} />

        <main className="flex-1 min-h-0 p-4 overflow-hidden">
          {activeView === 'terminal' ? (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <TerminalWindow />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="h-full grid grid-cols-12 grid-rows-6 gap-3"
            >
              {/* AI Command Center — large left panel */}
              <motion.div variants={fadeInUp} className="col-span-5 row-span-4">
                <div className="h-full">
                  <AICommandCenter />
                </div>
              </motion.div>

              {/* Top-right: CPU + Memory */}
              <motion.div variants={fadeInUp} className="col-span-3 row-span-3">
                <CPUWidget />
              </motion.div>

              <motion.div variants={fadeInUp} className="col-span-2 row-span-3">
                <MemoryWidget />
              </motion.div>

              <motion.div variants={fadeInUp} className="col-span-2 row-span-3">
                <AIActivityWidget />
              </motion.div>

              {/* Middle row */}
              <motion.div variants={fadeInUp} className="col-span-4 row-span-2">
                <NotesWidget />
              </motion.div>

              <motion.div variants={fadeInUp} className="col-span-3 row-span-2">
                <WorkspaceWidget />
              </motion.div>

              {/* Bottom: AI Command Center overflow / terminal preview */}
              <motion.div variants={fadeInUp} className="col-span-5 row-span-2">
                <div className="h-full widget-card flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs font-mono text-slate-700">Click</p>
                    <button
                      onClick={() => setActiveView('terminal')}
                      className="mt-1 text-xs font-mono text-sky-500/60 hover:text-sky-400 transition-colors flex items-center gap-1 mx-auto"
                    >
                      Open Terminal →
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="col-span-7 row-span-2">
                <div className="h-full widget-card overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-sky-500/50" />
                    <span className="text-[10px] font-mono text-slate-600 tracking-widest">SYSTEM LOG</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      'kernel: TAURIQ v0.1.0 initialized',
                      'ai_bridge: neural subsystem standby',
                      'fs: virtual filesystem mounted',
                      'ui: compositor started — 60fps',
                    ].map((log, i) => (
                      <motion.p
                        key={log}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="text-[10px] font-mono text-slate-700"
                      >
                        <span className="text-sky-800 mr-2">[{String(i).padStart(2, '0')}]</span>
                        {log}
                      </motion.p>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
    </motion.div>
  )
}
`;

// ─── Write all files ───────────────────────────────────────────────────────────
const files = {
  'src/index.css': indexCss,
  'src/App.css': appCss,
  'src/main.tsx': mainTsx,
  'src/App.tsx': appTsx,
  'src/utils/cn.ts': cnUtil,
  'src/hooks/useSystemTime.ts': useSystemTime,
  'src/hooks/useSystemStats.ts': useSystemStats,
  'src/animations/variants.ts': variants,
  'src/components/BootScreen.tsx': bootScreen,
  'src/components/Sidebar.tsx': sidebar,
  'src/components/TopBar.tsx': topBar,
  'src/components/AICommandCenter.tsx': aiCommandCenter,
  'src/widgets/CPUWidget.tsx': cpuWidget,
  'src/widgets/MemoryWidget.tsx': memoryWidget,
  'src/widgets/AIActivityWidget.tsx': aiActivityWidget,
  'src/widgets/NotesWidget.tsx': notesWidget,
  'src/widgets/WorkspaceWidget.tsx': workspaceWidget,
  'src/components/TerminalWindow.tsx': terminalWindow,
  'src/layouts/Desktop.tsx': desktop,
}

let written = 0
for (const [path, content] of Object.entries(files)) {
  const dir = path.substring(0, path.lastIndexOf('/'))
  if (dir) mkdirSync(dir, { recursive: true })
  writeFileSync(path, content, 'utf8')
  written++
}

console.log(`Written ${written} files successfully.`)
