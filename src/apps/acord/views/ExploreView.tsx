import { motion } from 'framer-motion'
import { GENRES, MOODS, TRACKS } from '../acordMockData'
import { useAcordStore } from '../acordStore'

export default function ExploreView() {
  const { play } = useAcordStore()

  return (
    <div className="h-full overflow-y-auto p-5 no-scrollbar">
      <h2 className="mb-5 text-lg font-bold text-slate-100">Explorar</h2>

      {/* Moods */}
      <section className="mb-7">
        <h3 className="mb-3 text-sm font-semibold text-slate-300">Por Estado de Ánimo</h3>
        <div className="grid grid-cols-3 gap-3">
          {MOODS.map((mood, i) => {
            const tracks = TRACKS.filter((t) => t.moods.includes(mood.name))
            return (
              <motion.div
                key={mood.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => tracks[0] && play(tracks[0])}
                className="relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-4 transition-transform hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${mood.color}cc, ${mood.color}33)`, minHeight: 100 }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.05),transparent)]" />
                <span className="text-3xl">{mood.emoji}</span>
                <div>
                  <p className="font-semibold text-white">{mood.name}</p>
                  <p className="text-[10px] text-white/60">{tracks.length} canción{tracks.length !== 1 ? 'es' : ''}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Genres */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-300">Por Género</h3>
        <div className="grid grid-cols-2 gap-3">
          {GENRES.map((genre, i) => (
            <motion.div
              key={genre.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 transition-all hover:border-white/[0.12] hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: genre.color }} />
                <p className="text-sm font-medium text-slate-200">{genre.name}</p>
              </div>
              <span className="text-[10px] font-mono text-slate-600">{genre.count} canciones</span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
