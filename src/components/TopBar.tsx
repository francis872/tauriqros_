import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BatteryFull, Wifi, Power, RotateCcw, Download, Moon, ChevronDown } from 'lucide-react'
import { useSystemTime } from '../hooks/useSystemTime'
import { fadeIn } from '../animations/variants'

export default function TopBar() {
  const { formatted, date } = useSystemTime()
  const [showSystemMenu, setShowSystemMenu] = useState(false)
  const [systemMessage, setSystemMessage] = useState('')

  const handleSystemCommand = (command: string) => {
    switch (command) {
      case 'restart':
        setSystemMessage('System restart scheduled in 1 minute...')
        break
      case 'shutdown':
        setSystemMessage('System shutdown scheduled in 1 minute...')
        break
      case 'suspend':
        setSystemMessage('System suspended...')
        break
      case 'update':
        setSystemMessage('Checking for updates...')
        break
    }
    setShowSystemMenu(false)
  }

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-12 w-full glass-panel border-b border-cyan-200/10 flex items-center px-5 gap-4 z-20 shrink-0"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs font-mono text-cyan-100/85 tracking-[0.2em]">TAURIQ DESKTOP</span>
        <span className="text-slate-600 text-xs">•</span>
        <span className="text-xs font-mono text-slate-400">SYSTEM ONLINE</span>
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end relative">
        <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.03] text-cyan-100/90">
          <Wifi size={12} />
          <span>WiFi</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.03] text-cyan-100/90">
          <BatteryFull size={12} />
          <span>86%</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="relative p-2 rounded-md border border-white/10 bg-white/[0.03] text-cyan-100/90"
          aria-label="Notifications"
        >
          <Bell size={13} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
        </motion.button>

        {/* System Control Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowSystemMenu(!showSystemMenu)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="relative p-2 rounded-md border border-white/10 bg-white/[0.03] text-cyan-100/90 hover:bg-white/[0.08] transition-colors flex items-center gap-1"
            aria-label="System Control"
          >
            <Power size={13} />
            <ChevronDown size={11} />
          </motion.button>

          <AnimatePresence>
            {showSystemMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-[#0c1018]/95 border border-cyan-300/30 rounded-lg shadow-2xl overflow-hidden z-50"
              >
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => handleSystemCommand('update')}
                    className="w-full px-3 py-2 flex items-center gap-2 text-blue-300 hover:bg-blue-600/20 rounded transition-colors text-sm"
                  >
                    <Download size={13} />
                    Update
                  </button>
                  <button
                    onClick={() => handleSystemCommand('suspend')}
                    className="w-full px-3 py-2 flex items-center gap-2 text-purple-300 hover:bg-purple-600/20 rounded transition-colors text-sm"
                  >
                    <Moon size={13} />
                    Suspend
                  </button>
                  <button
                    onClick={() => handleSystemCommand('restart')}
                    className="w-full px-3 py-2 flex items-center gap-2 text-orange-300 hover:bg-orange-600/20 rounded transition-colors text-sm"
                  >
                    <RotateCcw size={13} />
                    Restart
                  </button>
                  <button
                    onClick={() => handleSystemCommand('shutdown')}
                    className="w-full px-3 py-2 flex items-center gap-2 text-red-300 hover:bg-red-600/20 rounded transition-colors text-sm"
                  >
                    <Power size={13} />
                    Shutdown
                  </button>
                </div>
                <div className="border-t border-cyan-300/20 px-3 py-2 bg-white/[0.02]">
                  <p className="text-cyan-400/50 text-xs">(1-minute delay on restart/shutdown)</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {systemMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-0 bottom-full mb-2 text-cyan-400 text-xs bg-[#0c1018]/95 border border-cyan-300/30 rounded px-3 py-2 whitespace-nowrap"
          >
            {systemMessage}
          </motion.div>
        )}

        <div className="flex items-center gap-2 text-xs font-mono pl-2 border-l border-white/10">
          <span className="text-slate-400">{date}</span>
          <span className="text-cyan-100 font-semibold tracking-wider">{formatted}</span>
        </div>
      </div>
    </motion.header>
  )
}
