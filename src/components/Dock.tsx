import type { ElementType, MouseEvent } from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen, Terminal, BookOpen, Zap, Settings, Activity,
  Sparkles, Bell, Clock3, Search, Folder, ChevronLeft, ChevronRight, Globe, Radio, Network
} from 'lucide-react'
import RelayIcon from '../apps/relay/RelayIcon'
import { useDesktopStore } from '../store/desktopStore'
import { APP_REGISTRY } from '../apps/registry'
import { cn } from '../utils/cn'
import type { TauriqSessionRuntimeSnapshot } from '../session/tauriqSessionManager'

const ICON_MAP: Record<string, ElementType> = {
  relay: RelayIcon as ElementType,
  files: FolderOpen,
  terminal: Terminal,
  notes: BookOpen,
  ai: Zap,
  browser: Globe,
  settings: Settings,
  monitor: Activity,
  timeline: Clock3,
  'ascii-search': Search,
  dare: Folder,
  jumper: Radio,
  mylynk: Network,
}

interface DockProps {
  runtimeSnapshot: TauriqSessionRuntimeSnapshot | null
  unreadCount: number
  onOpenNotifications: () => void
  onOpenLauncher: () => void
}

export default function Dock({ runtimeSnapshot, unreadCount, onOpenNotifications, onOpenLauncher }: DockProps) {
  const { openApp, restoreWindow, focusWindow, minimizeWindow, windows, activeWorkspaceId, focusedWindowId, pinnedApps, dockCollapsed, toggleDockCollapsed, toggleAppPinned } = useDesktopStore()

  const isDockExpanded = !dockCollapsed
  const aiQueueDepth = runtimeSnapshot?.core.aiRuntime.queueDepth ?? 0
  const anomalies = runtimeSnapshot?.core.healing.anomalies.length ?? 0
  const meshPeers = runtimeSnapshot?.core.distributed.peers.length ?? 0
  const gpuLoad = runtimeSnapshot?.core.nativeExecution?.gpu?.telemetry?.utilization ?? 0

  // Live clock
  const [clock, setClock] = useState(() => formatClock())
  useEffect(() => {
    const id = setInterval(() => setClock(formatClock()), 10_000)
    return () => clearInterval(id)
  }, [])

  // All windows in the current workspace
  const workspaceWindows = windows.filter((w) => w.workspaceId === activeWorkspaceId)

  // Pinned app click: open / focus / minimize-toggle
  const handlePinnedClick = (appId: string) => {
    const win = workspaceWindows.find((w) => w.appId === appId)
    if (win?.minimized) { restoreWindow(win.id); return }
    if (win) {
      if (focusedWindowId === win.id) { minimizeWindow(win.id); return }
      focusWindow(win.id)
      return
    }
    const app = APP_REGISTRY[appId]
    if (app) openApp(app.id, app.label, app.defaultWidth, app.defaultHeight)
  }

  // Open windows that are NOT in DOCK_APPS (unpinned windows)
  const unpinnedWindows = workspaceWindows.filter((w) => !pinnedApps.includes(w.appId))

  const handleWindowClick = (win: typeof workspaceWindows[0]) => {
    if (win.minimized) { restoreWindow(win.id); return }
    if (focusedWindowId === win.id) { minimizeWindow(win.id); return }
    focusWindow(win.id)
  }

  return (
    <div className={cn(
      'relative flex w-full flex-shrink-0 items-center gap-1 border-t border-cyan-200/10 bg-[#05080f]/92 px-2 backdrop-blur-2xl transition-all',
      dockCollapsed ? 'h-10' : 'h-12',
    )}>
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.04),transparent_40%,rgba(139,92,246,0.04)_100%)]" />

      <button
        title="Toggle dock collapse"
        onClick={toggleDockCollapsed}
        className="relative z-10 mr-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-all hover:bg-white/[0.08] hover:text-slate-100"
      >
        {dockCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* ── Launcher / Start button ── */}
      <button
        title="TAURIQ Launcher (Super)"
        onClick={onOpenLauncher}
        className="relative z-10 mr-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/12 text-cyan-200 transition-all hover:bg-cyan-300/22 hover:shadow-[0_0_14px_rgba(34,211,238,0.35)]"
      >
        <Sparkles size={16} />
        {(aiQueueDepth > 0 || anomalies > 0) && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-300 text-[8px] font-mono font-bold text-[#031018] shadow-[0_0_8px_rgba(34,211,238,0.8)]">
            {Math.min(aiQueueDepth + anomalies, 9)}
          </span>
        )}
      </button>

      {/* Divider */}
      {isDockExpanded && <div className="mx-0.5 h-6 w-px flex-shrink-0 bg-cyan-200/12" />}

      {/* ── Pinned apps ── */}
      {isDockExpanded && pinnedApps.map((appId) => {
        const app = APP_REGISTRY[appId]
        const Icon = ICON_MAP[appId] ?? Activity
        const win = workspaceWindows.find((w) => w.appId === appId)
        const isOpen = !!win && !win.minimized
        const isMinimized = !!win && win.minimized
        const isFocused = win?.id === focusedWindowId

        return (
          <PinnedButton
            key={appId}
            icon={Icon}
            label={app.label}
            isOpen={isOpen}
            isMinimized={isMinimized}
            isFocused={isFocused}
            onClick={() => handlePinnedClick(appId)}
            onContextMenu={(event) => {
              event.preventDefault()
              toggleAppPinned(appId)
            }}
          />
        )
      })}

      {/* Divider before unpinned open windows */}
      <AnimatePresence>
        {isDockExpanded && unpinnedWindows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="mx-0.5 h-6 w-px flex-shrink-0 bg-violet-400/20"
          />
        )}
      </AnimatePresence>

      {/* ── Open unpinned windows ── */}
      <AnimatePresence initial={false}>
        {isDockExpanded && unpinnedWindows.map((win) => {
          const Icon = ICON_MAP[win.appId] ?? Activity
          return (
            <WindowTaskButton
              key={win.id}
              icon={Icon}
              title={win.title}
              isMinimized={win.minimized}
              isFocused={win.id === focusedWindowId}
              onClick={() => handleWindowClick(win)}
              onContextMenu={(event) => {
                event.preventDefault()
                toggleAppPinned(win.appId)
              }}
            />
          )
        })}
      </AnimatePresence>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── System tray ── */}
      {isDockExpanded && (
        <div className="relative z-10 flex flex-shrink-0 items-center gap-1">
        <div className="hidden rounded-md border border-cyan-200/10 bg-cyan-300/5 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-cyan-200/60 lg:flex">
          peers {meshPeers} · heal {anomalies === 0 ? 'ok' : anomalies} · gpu {gpuLoad}%
        </div>

        <button
          title="Notifications"
          onClick={onOpenNotifications}
          className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 transition-all hover:bg-white/[0.08] hover:text-slate-200"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-mono font-bold text-[#1a1200] shadow-[0_0_8px_rgba(251,191,36,0.7)]">
              {Math.min(unreadCount, 9)}
            </span>
          )}
        </button>

        <div className="flex h-9 flex-col items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5">
          <span className="font-mono text-[11px] font-medium text-cyan-100">{clock.time}</span>
          <span className="font-mono text-[9px] text-slate-500">{clock.date}</span>
        </div>
      </div>
      )}
    </div>
  )
}

function formatClock() {
  const now = new Date()
  return {
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    date: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  }
}

// ── Pinned app icon button (always visible) ──────────────────────────────────
interface PinnedButtonProps {
  icon: ElementType
  label: string
  isOpen: boolean
  isMinimized: boolean
  isFocused: boolean
  onClick: () => void
  onContextMenu?: (event: MouseEvent<HTMLButtonElement>) => void
}

function PinnedButton({ icon: Icon, label, isOpen, isMinimized, isFocused, onClick, onContextMenu }: PinnedButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      onContextMenu={onContextMenu}
      whileHover={{ y: -3, scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      title={label}
      className={cn(
        'relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-150',
        isFocused
          ? 'border border-cyan-500/45 bg-cyan-500/18 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.22)]'
          : isOpen || isMinimized
            ? 'border border-sky-500/25 bg-sky-500/10 text-sky-300'
            : 'border border-white/[0.07] bg-white/[0.04] text-slate-500 hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-slate-300',
      )}
    >
      <Icon size={16} />

      {/* Bottom indicator bar */}
      <AnimatePresence>
        {(isOpen || isMinimized) && (
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full',
              isFocused ? 'bg-cyan-400' : isMinimized ? 'bg-amber-400/70' : 'bg-sky-400/70',
            )}
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ── Open window labeled button (unpinned windows) ─────────────────────────────
interface WindowTaskButtonProps {
  icon: ElementType
  title: string
  isMinimized: boolean
  isFocused: boolean
  onClick: () => void
  onContextMenu?: (event: MouseEvent<HTMLButtonElement>) => void
}

function WindowTaskButton({ icon: Icon, title, isMinimized, isFocused, onClick, onContextMenu }: WindowTaskButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      onContextMenu={onContextMenu}
      initial={{ opacity: 0, scale: 0.88, x: -8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.88, x: -8 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      className={cn(
        'relative z-10 flex h-9 max-w-[156px] flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 transition-all duration-150',
        isFocused
          ? 'border border-cyan-500/40 bg-cyan-500/15 text-cyan-200'
          : isMinimized
            ? 'border border-white/[0.07] bg-white/[0.03] text-slate-500'
            : 'border border-sky-500/20 bg-sky-500/08 text-sky-300',
      )}
    >
      <Icon size={13} className="flex-shrink-0" />
      <span className="truncate font-mono text-[10px] tracking-wide leading-none">{title}</span>

      {/* Bottom indicator */}
      <span
        className={cn(
          'absolute -bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full',
          isFocused ? 'bg-cyan-400' : isMinimized ? 'bg-amber-400/60' : 'bg-sky-400/60',
        )}
      />
    </motion.button>
  )
}

