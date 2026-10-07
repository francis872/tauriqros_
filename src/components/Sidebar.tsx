import { motion } from 'framer-motion'
import { Home, FolderOpen, Terminal, Settings, Sparkles } from 'lucide-react'
import { cn } from '../utils/cn'
import { slideInLeft } from '../animations/variants'

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'ai', icon: Sparkles, label: 'AI' },
  { id: 'files', icon: FolderOpen, label: 'Files' },
  { id: 'terminal', icon: Terminal, label: 'Terminal' },
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
      className="w-20 h-full glass-panel border-r border-cyan-200/10 flex flex-col items-center py-5 gap-2 z-20"
    >
      <div className="mb-5">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border border-cyan-300/45 flex items-center justify-center shadow-[0_0_18px_rgba(34,211,238,0.2)]"
        >
          <span className="text-cyan-100 text-sm font-bold font-mono">T</span>
        </motion.div>
      </div>

      <div className="flex flex-col gap-2 flex-1 w-full px-3">
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
                'relative w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200 group',
                isActive
                  ? 'bg-cyan-400/15 border border-cyan-300/45 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)]'
                  : 'text-slate-400 hover:text-cyan-100 hover:bg-white/[0.06]'
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 w-0.5 h-5 bg-cyan-300 rounded-r-full"
                />
              )}
              <div className="absolute left-full ml-3 px-2 py-1 bg-[#0c1018]/95 border border-cyan-300/20 rounded text-xs text-cyan-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono z-50">
                {item.label}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.aside>
  )
}
