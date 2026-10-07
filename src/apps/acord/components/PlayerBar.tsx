import { SkipBack, SkipForward, Play, Pause, Shuffle, Repeat, Repeat1, Heart, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { useAcordStore, formatTime } from '../acordStore'

export default function PlayerBar() {
  const {
    currentTrack, isPlaying, position, volume, shuffle, repeat,
    likedTrackIds, pause, resume, next, prev, seek, setVolume,
    toggleShuffle, toggleRepeat, toggleLike, setView,
  } = useAcordStore()

  if (!currentTrack) return null

  const progress = currentTrack.duration > 0 ? position / currentTrack.duration : 0
  const isLiked = likedTrackIds.includes(currentTrack.id)

  const [from, to] = currentTrack.coverGradient

  return (
    <div className="relative flex h-20 flex-shrink-0 items-center gap-4 border-t border-white/[0.06] bg-[#06040e]/95 px-4 backdrop-blur-xl">
      {/* Left: track info */}
      <div className="flex w-56 flex-shrink-0 items-center gap-3">
        {currentTrack.coverUrl
          ? <img src={currentTrack.coverUrl} alt={currentTrack.album} className="h-12 w-12 flex-shrink-0 rounded-xl shadow-lg object-cover" />
          : <div className="h-12 w-12 flex-shrink-0 rounded-xl shadow-lg" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
        }
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">{currentTrack.title}</p>
          <p className="truncate text-xs text-slate-500">{currentTrack.artist}</p>
        </div>
        <button
          onClick={() => toggleLike(currentTrack.id)}
          className={`flex-shrink-0 p-1 transition-colors ${isLiked ? 'text-violet-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <Heart size={15} className={isLiked ? 'fill-violet-400' : ''} />
        </button>
      </div>

      {/* Center: controls + progress */}
      <div className="flex flex-1 flex-col items-center gap-1.5">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-1 transition-colors ${shuffle ? 'text-violet-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <Shuffle size={14} />
          </button>
          <button onClick={prev} className="p-1 text-slate-400 transition-colors hover:text-slate-100">
            <SkipBack size={18} />
          </button>
          <button
            onClick={() => (isPlaying ? pause() : resume())}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-900/50 transition-all hover:scale-105 hover:bg-violet-500"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="pl-0.5" />}
          </button>
          <button onClick={next} className="p-1 text-slate-400 transition-colors hover:text-slate-100">
            <SkipForward size={18} />
          </button>
          <button
            onClick={toggleRepeat}
            className={`p-1 transition-colors ${repeat !== 'none' ? 'text-violet-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            {repeat === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex w-full max-w-md items-center gap-2">
          <span className="w-8 text-right text-[10px] font-mono text-slate-600">{formatTime(position)}</span>
          <div
            className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/10"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              seek(Math.floor(pct * currentTrack.duration))
            }}
          >
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-violet-300 shadow opacity-0 transition-opacity group-hover:opacity-100"
              style={{ left: `calc(${progress * 100}% - 6px)` }}
            />
          </div>
          <span className="w-8 text-[10px] font-mono text-slate-600">{formatTime(currentTrack.duration)}</span>
        </div>
      </div>

      {/* Right: volume + liryq */}
      <div className="flex w-48 flex-shrink-0 items-center justify-end gap-3">
        {/* Liryq shortcut */}
        <button
          onClick={() => setView('liryq')}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-300 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/20"
        >
          <Sparkles size={11} />
          Liryq
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="text-slate-500 transition-colors hover:text-slate-300"
          >
            {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-20 cursor-pointer accent-violet-500"
          />
        </div>
      </div>
    </div>
  )
}
