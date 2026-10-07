import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootScreenProps {
  onComplete: () => void
}

const bootMessages = [
  'Initializing quantum kernel',
  'Syncing AI orchestrator',
  'Mounting encrypted workspace',
  'Warming real-time terminal stack',
  'Preparing TAURIQ desktop scene',
]

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + Math.random() * 16 + 8, 100)
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
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.18)_0%,transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.55)_75%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:38px_38px]" />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative flex flex-col items-center gap-7 mb-16"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.02, 1] }}
              transition={{ rotate: { duration: 11, repeat: Infinity, ease: 'linear' }, scale: { duration: 2.4, repeat: Infinity } }}
              className="w-24 h-24 relative"
            >
              <div className="absolute inset-0 rounded-full border border-cyan-300/30 shadow-[0_0_28px_rgba(34,211,238,0.22)]" />
              <div className="absolute inset-3 rounded-full border border-cyan-300/45" />
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-6 rounded-full bg-cyan-300/10 border border-cyan-200/70 flex items-center justify-center"
              >
                <span className="text-cyan-200 font-mono font-bold text-xl tracking-wide">T</span>
              </motion.div>
            </motion.div>

            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-[0.34em] text-white font-mono [text-shadow:0_0_24px_rgba(103,232,249,0.5)]">
                TAURIQ
              </h1>
              <p className="text-cyan-300/60 text-[10px] tracking-[0.42em] font-mono mt-2 uppercase">
                AI-NATIVE OPERATING ENVIRONMENT
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-[21rem] flex flex-col gap-3"
          >
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-500 rounded-full shadow-[0_0_24px_rgba(34,211,238,0.55)]"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-slate-400">
                {bootMessages[msgIndex]}
              </p>
              <span className="text-xs font-mono text-cyan-200/85">
                {Math.floor(progress)}%
              </span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-xs font-mono text-slate-500 tracking-[0.25em]"
          >
            TAURIQ OS v0.1.0-alpha
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
