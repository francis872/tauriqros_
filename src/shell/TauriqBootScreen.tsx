import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface TauriqBootScreenProps {
  onComplete: () => void
}

const bootMessages = [
  'Initializing TAURIQ session manager',
  'Negotiating Linux user services',
  'Linking AI-native workflow graph',
  'Hydrating desktop shell runtime',
  'Preparing immersive compositor surface',
]

export default function TauriqBootScreen({ onComplete }: TauriqBootScreenProps) {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((previous) => {
        const increment = Math.random() * 12 + 7
        const next = Math.min(previous + increment, 100)

        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsExiting(true)
            setTimeout(onComplete, 700)
          }, 450)
        }

        return next
      })

      setMessageIndex((previous) => (previous + 1) % bootMessages.length)
    }, 430)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="tauriq-boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
        >
          <div className="absolute inset-0 bg-[radial-gradient(58%_58%_at_50%_40%,rgba(34,211,238,0.3),transparent_66%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(45%_50%_at_82%_20%,rgba(139,92,246,0.2),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex w-[26rem] max-w-[90vw] flex-col items-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="relative mb-8 h-28 w-28"
            >
              <div className="absolute inset-0 rounded-full border border-cyan-300/30 shadow-[0_0_45px_rgba(34,211,238,0.4)]" />
              <div className="absolute inset-4 rounded-full border border-cyan-200/50" />
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-8 flex items-center justify-center rounded-full border border-cyan-100/70 bg-cyan-300/10"
              >
                <span className="font-mono text-2xl font-bold tracking-[0.2em] text-cyan-100">TQ</span>
              </motion.div>
            </motion.div>

            <h1 className="font-mono text-5xl font-semibold tracking-[0.36em] text-white [text-shadow:0_0_36px_rgba(34,211,238,0.75)]">
              TAURIQ
            </h1>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.42em] text-cyan-300/80">
              AI Native Desktop Environment
            </p>

            <div className="mt-12 w-full">
              <div className="h-2 overflow-hidden rounded-full border border-cyan-300/25 bg-white/10 backdrop-blur-sm">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 shadow-[0_0_30px_rgba(34,211,238,0.7)]"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400">{bootMessages[messageIndex]}</span>
                <span className="tracking-wider text-cyan-200">{Math.floor(progress)}%</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-8 text-[11px] font-mono tracking-[0.24em] text-slate-500"
          >
            TAURIQ PHASE 2 PRELUDE
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
