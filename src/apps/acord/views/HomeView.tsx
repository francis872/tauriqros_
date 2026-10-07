import { Play, Heart, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAcordStore } from '../acordStore'
import { TRACKS, ALBUMS, PLAYLISTS } from '../acordMockData'
import type { Track } from '../acordTypes'

function TrackCard({ track, index }: { track: Track; index: number }) {
  const { play, toggleLike, likedTrackIds } = useAcordStore()
  const [from, to] = track.coverGradient
  const isLiked = likedTrackIds.includes(track.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.06] cursor-pointer"
      onClick={() => play(track)}
    >
      <div
        className="mb-3 aspect-square w-full rounded-xl"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      />
      <p className="truncate text-sm font-semibold text-slate-200">{track.title}</p>
      <p className="truncate text-xs text-slate-500">{track.artist}</p>
      <div className="mt-2 flex items-center gap-1">
        {track.moods.slice(0, 1).map((mood) => (
          <span key={mood} className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] text-violet-300">{mood}</span>
        ))}
      </div>
      {/* Hover controls */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(track.id) }}
          className={`rounded-full p-1.5 backdrop-blur-sm ${isLiked ? 'bg-violet-500/30 text-violet-300' : 'bg-black/40 text-slate-400'}`}
        >
          <Heart size={11} className={isLiked ? 'fill-violet-300' : ''} />
        </button>
        <button className="rounded-full bg-violet-600 p-1.5">
          <Play size={11} className="fill-white text-white pl-0.5" />
        </button>
      </div>
    </motion.div>
  )
}

export default function HomeView() {
  const { play, currentTrack } = useAcordStore()

  const featured = TRACKS[0]
  const [fromF, toF] = featured.coverGradient

  return (
    <div className="h-full overflow-y-auto p-5 no-scrollbar">
      {/* Hero featured track */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 overflow-hidden rounded-3xl p-6"
        style={{ background: `linear-gradient(135deg, ${fromF}cc, #0f0920)` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.3),transparent_60%)]" />
        <div className="relative flex items-end gap-5">
          <div
            className="h-24 w-24 flex-shrink-0 rounded-2xl shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${fromF}, ${toF})` }}
          />
          <div className="flex-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-violet-300/70">Destacado hoy</p>
            <h2 className="mt-1 text-2xl font-bold text-white">{featured.title}</h2>
            <p className="text-sm text-slate-300">{featured.artist} · {featured.album}</p>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => play(featured)}
                className="flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-900/50 hover:bg-violet-500 transition-colors"
              >
                <Play size={14} className="fill-white" />
                Reproducir
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Now playing indicator */}
      {currentTrack && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2">
          <div className="flex gap-0.5">
            {[1,2,3].map((i) => (
              <div key={i} className="w-0.5 rounded-full bg-violet-400 animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <p className="text-xs text-violet-300">Reproduciendo: <span className="font-semibold">{currentTrack.title}</span> · {currentTrack.artist}</p>
        </div>
      )}

      {/* New releases */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Lanzamientos recientes</h3>
          <button className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
            Ver todo <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
          {TRACKS.slice(0, 4).map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>
      </section>

      {/* Featured playlists */}
      <section className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Playlists para ti</h3>
        <div className="grid grid-cols-2 gap-3">
          {PLAYLISTS.map((pl, i) => (
            <motion.div
              key={pl.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors cursor-pointer group"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: pl.color + '33' }}>
                <span style={{ color: pl.color }} className="text-lg">♪</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-200">{pl.title}</p>
                <p className="text-[10px] text-slate-500">{pl.trackIds.length} canciones</p>
              </div>
              <Play size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Albums */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Álbumes</h3>
        <div className="grid grid-cols-3 gap-3 xl:grid-cols-5">
          {ALBUMS.map((al, i) => (
            <motion.div
              key={al.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex flex-col gap-2 cursor-pointer group"
            >
              <div
                className="aspect-square w-full rounded-2xl transition-transform group-hover:scale-[1.03]"
                style={{ background: `linear-gradient(135deg, ${al.gradient[0]}, ${al.gradient[1]})` }}
              />
              <p className="truncate text-xs font-semibold text-slate-300">{al.title}</p>
              <p className="text-[10px] text-slate-600">{al.artistName} · {al.year}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
