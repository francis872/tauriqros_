import { motion, AnimatePresence } from 'framer-motion'
import type { AppWindow } from '../../store/desktopStore'

interface WindowPreviewProps {
  window: AppWindow
  visible: boolean
}

export default function WindowPreview({ window, visible }: WindowPreviewProps) {
  if (!visible) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed z-40 rounded-lg border border-cyan-300/30 bg-[#0a1018]/90 shadow-2xl overflow-hidden backdrop-blur-xl"
          style={{
            width: Math.min(400, window.width * 0.8),
            height: Math.min(300, window.height * 0.8),
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Preview Header */}
          <div className="h-8 border-b border-cyan-300/20 bg-cyan-300/5 px-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-300/40" />
            <p className="text-xs text-cyan-100/70 font-mono truncate flex-1">
              {window.title}
            </p>
          </div>

          {/* Preview Content */}
          <div className="flex-1 bg-[#050810]/50 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05),transparent)]" />
            <div className="text-center pointer-events-none">
              <p className="text-xs text-slate-400">
                {window.title}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {window.width} × {window.height}
              </p>
            </div>

            {/* Activity Indicator */}
            <div className="absolute inset-0 border border-cyan-300/20" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
