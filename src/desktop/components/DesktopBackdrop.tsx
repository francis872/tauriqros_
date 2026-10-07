import { motion } from 'framer-motion'

export default function DesktopBackdrop() {
  const particles = Array.from({ length: 18 }, (_, index) => ({
    id: index,
    left: 8 + (index * 5.1) % 84,
    delay: (index % 6) * 0.9,
    duration: 12 + (index % 5) * 2,
  }))

  return (
    <>
      <div className="absolute inset-0 bg-[#020305]" />
      <div className="absolute inset-0 bg-[radial-gradient(58%_58%_at_82%_10%,rgba(34,211,238,0.28),transparent_64%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(44%_52%_at_12%_80%,rgba(139,92,246,0.16),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:34px_34px] opacity-25" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_40%,rgba(255,255,255,0.01)_80%)] opacity-25" />

      <motion.div
        animate={{ opacity: [0.3, 0.65, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 right-24 h-[360px] w-[360px] rounded-full bg-cyan-400/20 blur-[130px]"
      />

      <motion.div
        animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.03, 1] }}
        transition={{ duration: 8.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-20 left-12 h-[300px] w-[300px] rounded-full bg-violet-400/15 blur-[110px]"
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: -420, opacity: [0, 0.7, 0] }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ left: `${particle.left}%` }}
            className="absolute bottom-[-4rem] h-1 w-1 rounded-full bg-cyan-200/70 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
          />
        ))}
      </div>
    </>
  )
}
