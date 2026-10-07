import { motion } from 'framer-motion'
import { FolderOpen, Home, Settings, Sparkles, Terminal } from 'lucide-react'
import { cn } from '../../utils/cn'

export type SidebarItem = 'home' | 'ai' | 'files' | 'terminal' | 'settings'

interface DesktopSidebarProps {
  activeItem: SidebarItem
  onSelect: (item: SidebarItem) => void
}

const SIDEBAR_ITEMS: Array<{ id: SidebarItem; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function DesktopSidebar({ activeItem, onSelect }: DesktopSidebarProps) {
  return (
    <aside className="z-20 flex h-full w-[92px] shrink-0 flex-col items-center border-r border-cyan-200/10 bg-[#0a0d14]/70 py-6 backdrop-blur-xl">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="mb-7 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/45 shadow-[0_0_24px_rgba(34,211,238,0.35)]"
      >
        <span className="font-mono text-sm font-bold tracking-widest text-cyan-100">TQ</span>
      </motion.div>

      <nav className="flex w-full flex-1 flex-col gap-2 px-3">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.id === activeItem

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(item.id)}
              title={item.label}
              className={cn(
                'group relative flex aspect-square w-full items-center justify-center rounded-xl transition-all duration-200',
                isActive
                  ? 'border border-cyan-300/45 bg-cyan-400/15 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.22)]'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-cyan-100',
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.7} />

              {isActive && (
                <motion.div
                  layoutId="desktop-sidebar-indicator"
                  className="absolute left-0 h-5 w-0.5 rounded-r-full bg-cyan-300"
                />
              )}

              <span className="pointer-events-none absolute left-[calc(100%+12px)] rounded border border-cyan-300/25 bg-[#0b1018]/95 px-2 py-1 font-mono text-[11px] text-cyan-100 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </nav>
    </aside>
  )
}
