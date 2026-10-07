import { Heart, ListMusic, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAcordStore, formatTime } from '../acordStore'
import { TRACKS, PLAYLISTS } from '../acordMockData'

export default function LibraryView() {
  const { play, likedTrackIds, toggleLike } = useAcordStore()

  const likedTracks = TRACKS.filter((t) => likedTrackIds.includes(t.id))

  return (
    <div className="h-full overflow-y-auto p-5 no-scrollbar">
      <h2 className="mb-5 text-lg font-bold text-slate-100">Tu Biblioteca</h2>

      {/* Liked songs hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-4 rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, #3b0764, #0f172a)' }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/30">
          <Heart size={28} className="fill-violet-300 text-violet-300" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">Canciones que te gustan</p>
          <p className="text-sm text-slate-400">{likedTracks.length} canciones guardadas</p>
        </div>
      </motion.div>

      {/* Liked tracks list */}
      {likedTracks.length > 0 && (
        <section className="mb-6">
          <div className="space-y-1">
            {likedTracks.map((track, i) => {
              const [from, to] = track.coverGradient
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => play(track)}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white/[0.05]"
                >
                  <div className="h-9 w-9 flex-shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{track.title}</p>
                    <p className="truncate text-xs text-slate-500">{track.artist}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(track.id) }}
                    className="p-1 text-violet-400"
                  >
                    <Heart size={13} className="fill-violet-400" />
                  </button>
                  <span className="w-10 text-right text-[11px] font-mono text-slate-600">{formatTime(track.duration)}</span>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* Playlists */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-300">Mis Playlists</h3>
        <div className="space-y-2">
          {PLAYLISTS.map((pl, i) => {
            const tracks = TRACKS.filter((t) => pl.trackIds.includes(t.id))
            const totalMs = tracks.reduce((acc, t) => acc + t.duration, 0)

            return (
              <motion.div
                key={pl.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 cursor-pointer hover:border-white/[0.1] hover:bg-white/[0.05] transition-all"
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: pl.color + '22' }}
                >
                  <ListMusic size={20} style={{ color: pl.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200">{pl.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{pl.description}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{tracks.length} canciones · {formatTime(totalMs)}</p>
                </div>
                <button
                  onClick={() => tracks[0] && play(tracks[0])}
                  className="flex h-9 w-9 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: pl.color }}
                >
                  <Play size={14} className="fill-white text-white pl-0.5" />
                </button>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
