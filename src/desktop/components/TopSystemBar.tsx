import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BatteryMedium, Lock, Wifi, Menu, X } from 'lucide-react'
import { useSystemTime } from '../../hooks/useSystemTime'
import type { SessionRuntimeState } from '../../session/sessionModels'
import { WORKSPACES, type WorkspaceId } from '../../workspace/workspaceModels'
import type { UserIdentityProfile } from '../../profiles/profileModels'

interface TopSystemBarProps {
  sessionState: SessionRuntimeState
  activeWorkspaceId: WorkspaceId
  profile: UserIdentityProfile
  unreadCount: number
  onNotificationsClick: () => void
  onLauncherOpen: () => void
  onWorkspaceSwitch: (workspaceId: WorkspaceId) => void
  onLockRequest: () => void
}

export default function TopSystemBar({
  sessionState: _sessionState,
  activeWorkspaceId,
  profile: _profile,
  unreadCount,
  onNotificationsClick,
  onLauncherOpen,
  onWorkspaceSwitch,
  onLockRequest,
}: TopSystemBarProps) {
  const { formatted } = useSystemTime()
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex h-14 w-full shrink-0 items-center gap-2 border-b border-cyan-200/10 bg-[#090d15]/55 px-3 backdrop-blur-2xl md:px-4 lg:px-6"
    >
      {/* Left Section: Session Info */}
      <div className="flex w-auto shrink-0 items-center gap-2 overflow-hidden pr-2">
        <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100/90 md:text-[10px] lg:text-[11px]">
          TQ
        </span>
        <span className="hidden whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100/90 sm:inline md:text-[10px]">
          Session
        </span>
      </div>

      {/* Workspaces (Hidden on mobile, visible on tablet+) */}
      <div className="hidden items-center gap-1 md:flex md:flex-1">
        <div className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto">
          {WORKSPACES.slice(0, 3).map((workspace) => {
            const active = workspace.id === activeWorkspaceId
            return (
              <button
                key={workspace.id}
                onClick={() => onWorkspaceSwitch(workspace.id)}
                className={`whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[9px] transition-colors ${
                  active
                    ? 'border-cyan-300/45 bg-cyan-300/10 text-cyan-100'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-cyan-100'
                }`}
              >
                {workspace.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 md:hidden" />

      {/* Right Section: Controls */}
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {/* Notifications (Always visible) */}
        <button
          onClick={onNotificationsClick}
          className="relative flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-cyan-100/90 transition-colors hover:border-cyan-300/30 hover:bg-white/[0.08]"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={13} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-[12px] min-w-[12px] items-center justify-center rounded-full bg-cyan-300 px-0.5 text-[8px] font-mono font-bold text-[#031018] shadow-[0_0_10px_rgba(34,211,238,0.9)]">
              {Math.min(unreadCount, 9)}
            </span>
          )}
        </button>

        {/* Quick System Info (Hidden on mobile) */}
        <div className="hidden gap-1 lg:flex">
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-mono text-cyan-100/90">
            <Wifi size={10} />
            <span>WiFi</span>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-mono text-cyan-100/90">
            <BatteryMedium size={10} />
            <span>82%</span>
          </div>
        </div>

        {/* Time (Shown on larger screens) */}
        <div className="hidden items-center gap-1 border-l border-white/10 pl-1.5 text-right xl:flex">
          <div className="font-mono text-[10px] text-cyan-100">{formatted}</div>
        </div>

        {/* Tools Menu Toggle (Visible on mobile/tablet) */}
        <div className="relative">
          <button
            onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-cyan-100/90 transition-colors hover:border-cyan-300/30 hover:bg-white/[0.08] lg:hidden"
            aria-label="More options"
            title="More tools"
          >
            {toolsMenuOpen ? <X size={13} /> : <Menu size={13} />}
          </button>

          {/* Dropdown Menu for Tools */}
          <AnimatePresence>
            {toolsMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-cyan-300/30 bg-[#090d15]/95 shadow-2xl backdrop-blur-xl"
              >
                <button
                  onClick={() => {
                    onLauncherOpen()
                    setToolsMenuOpen(false)
                  }}
                  className="w-full border-b border-cyan-300/20 px-3 py-2 text-left text-sm font-mono text-cyan-100 hover:bg-cyan-300/10 transition-colors"
                >
                  Launcher
                </button>
                <button
                  onClick={() => {
                    onLockRequest()
                    setToolsMenuOpen(false)
                  }}
                  className="w-full border-b border-cyan-300/20 px-3 py-2 text-left text-sm font-mono text-cyan-100 hover:bg-cyan-300/10 transition-colors flex items-center gap-2"
                >
                  <Lock size={11} /> Lock Session
                </button>
                <div className="border-b border-cyan-300/20 px-3 py-2">
                  <div className="text-[9px] font-mono text-slate-400 mb-1">System Info</div>
                  <div className="flex items-center gap-1.5 text-[9px] text-cyan-100/80">
                    <Wifi size={10} /> WiFi · <BatteryMedium size={10} /> 82% · {formatted}
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-[9px] font-mono text-slate-400 mb-2">Workspace</div>
                  {WORKSPACES.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        onWorkspaceSwitch(workspace.id)
                        setToolsMenuOpen(false)
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                        workspace.id === activeWorkspaceId
                          ? 'bg-cyan-300/20 text-cyan-100'
                          : 'text-slate-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      {workspace.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Tools (Visible on large screens) */}
        <div className="hidden items-center gap-1 border-l border-white/10 pl-1.5 lg:flex">
          <button
            onClick={onLauncherOpen}
            className="flex h-8 items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-mono text-cyan-100/90 transition-colors hover:border-cyan-300/40 hover:text-cyan-50"
            title="Open Launcher"
          >
            Launcher
          </button>
          <button
            onClick={onLockRequest}
            className="flex h-8 items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-1 text-[9px] font-mono text-cyan-100/90 transition-colors hover:border-cyan-300/40 hover:text-cyan-50"
            title="Lock session"
          >
            <Lock size={10} />
          </button>
        </div>
      </div>
    </motion.header>
  )
}
