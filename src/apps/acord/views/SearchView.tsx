import { useState, useEffect, useCallback } from 'react'
import { Search, Play, Heart, Clock, Loader2, ChevronDown } from 'lucide-react'
import { useAcordStore, formatTime } from '../acordStore'
import { TRACKS } from '../acordMockData'
import { spotifySearch, isSpotifyConfigured } from '../services/spotifyService'
import { youtubeSearch, isYouTubeConfigured } from '../services/youtubeService'
import { jamendoSearch } from '../services/jamendoService'
import type { Track } from '../acordTypes'

type Source = 'local' | 'jamendo' | 'spotify' | 'youtube'

const SOURCE_META: Record<Source, { label: string; color: string; badge: string; desc: string }> = {
  local:   { label: 'Local',   color: '#7c3aed', badge: 'DEMO',   desc: 'Biblioteca de demo de Acordd' },
  jamendo: { label: 'Jamendo', color: '#0891b2', badge: '▶ MP3',  desc: '600K+ canciones CC — MP3 completo, sin API key' },
  spotify: { label: 'Spotify', color: '#1DB954', badge: '▶ 30s',  desc: 'Metadata real + previews de 30s' },
  youtube: { label: 'YouTube', color: '#dc2626', badge: '▶ FULL', desc: 'Todo lo mainstream — requiere Google API key' },
}

function TrackCover({ track }: { track: Track }) {
  if (track.coverUrl) {
    return <img src={track.coverUrl} alt={track.album} className="h-9 w-9 flex-shrink-0 rounded-lg object-cover" />
  }
  const [from, to] = track.coverGradient
  return <div className="h-9 w-9 flex-shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
}

function SourceBadge({ track }: { track: Track }) {
  if (track.ytVideoId)
    return <span className="hidden rounded-full border border-red-500/20 bg-red-500/5 px-2 py-0.5 text-[9px] text-red-400 sm:inline">▶ YT</span>
  if (track.previewUrl) {
    return track.id.startsWith('jm_')
      ? <span className="hidden rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 text-[9px] text-cyan-400 sm:inline">▶ MP3</span>
      : <span className="hidden rounded-full border border-green-500/20 bg-green-500/5 px-2 py-0.5 text-[9px] text-green-400 sm:inline">▶ 30s</span>
  }
  return null
}

export default function SearchView() {
  const [localQuery, setLocalQuery] = useState('')
  const [results, setResults] = useState<Track[]>(TRACKS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<Source>('jamendo')
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false)

  const { play, toggleLike, likedTrackIds } = useAcordStore()

  const runSearch = useCallback(async (q: string, src: Source) => {
    setError(null)

    if (!q.trim()) {
      setResults(TRACKS)
      return
    }

    if (src === 'local') {
      const qLow = q.toLowerCase()
      setResults(TRACKS.filter((t) =>
        t.title.toLowerCase().includes(qLow) ||
        t.artist.toLowerCase().includes(qLow) ||
        t.genre.toLowerCase().includes(qLow) ||
        t.moods.some((m) => m.toLowerCase().includes(qLow))
      ))
      return
    }

    setLoading(true)
    try {
      let tracks: Track[] = []
      if (src === 'jamendo') {
        tracks = await jamendoSearch(q, 24)
      } else if (src === 'spotify') {
        if (!isSpotifyConfigured()) {
          setError('Spotify no configurado — agrega VITE_SPOTIFY_CLIENT_ID y VITE_SPOTIFY_CLIENT_SECRET en .env')
        } else {
          tracks = await spotifySearch(q, 24)
        }
      } else if (src === 'youtube') {
        if (!isYouTubeConfigured()) {
          setError('YouTube no configurado — agrega VITE_YOUTUBE_API_KEY en .env (gratis en console.developers.google.com)')
        } else {
          tracks = await youtubeSearch(q, 20)
        }
      }
      setResults(tracks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce 450ms
  useEffect(() => {
    const id = setTimeout(() => runSearch(localQuery, source), 450)
    return () => clearTimeout(id)
  }, [localQuery, source, runSearch])

  const meta = SOURCE_META[source]

  return (
    <div className="h-full overflow-y-auto p-5 no-scrollbar" onClick={() => setSourceMenuOpen(false)}>
      {/* Search bar */}
      <div className="relative mb-4">
        {loading
          ? <Loader2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin text-violet-400" />
          : <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        }
        <input
          autoFocus
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={`Buscar en ${meta.label}...`}
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.05] py-3.5 pl-11 pr-36 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-white/[0.07] transition-all"
        />

        {/* Source picker pill */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <button
            onClick={(e) => { e.stopPropagation(); setSourceMenuOpen((v) => !v) }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all hover:opacity-90"
            style={{ background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}44` }}
          >
            {meta.label} <ChevronDown size={10} />
          </button>

          {sourceMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full z-30 mt-1.5 w-64 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0815] shadow-2xl"
            >
              {(Object.entries(SOURCE_META) as Array<[Source, typeof meta]>).map(([key, sm]) => (
                <button
                  key={key}
                  onClick={() => { setSource(key); setSourceMenuOpen(false) }}
                  className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${source === key ? 'bg-white/[0.04]' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: sm.color }}>{sm.label}</span>
                    <span className="rounded-full px-1.5 py-0.5 text-[8px] font-mono" style={{ background: sm.color + '22', color: sm.color }}>{sm.badge}</span>
                    {source === key && <span className="ml-auto text-[9px] text-slate-500">activo</span>}
                  </div>
                  <span className="text-[10px] leading-relaxed text-slate-600">{sm.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 flex items-center justify-between px-1">
        <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: meta.color + 'bb' }}>
          {meta.label} · {results.length} resultado{results.length !== 1 ? 's' : ''}
          {localQuery.trim() ? ` · "${localQuery}"` : ''}
        </p>
      </div>

      {/* Error/info banner */}
      {error && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-400">
          {error}
        </div>
      )}

      {/* Track list */}
      <div className="space-y-1">
        {results.map((track, i) => {
          const isLiked = likedTrackIds.includes(track.id)

          return (
            <div
              key={track.id}
              onClick={() => play(track)}
              className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white/[0.05]"
            >
              <div className="w-5 flex-shrink-0 text-center text-xs text-slate-600">
                <span className="group-hover:hidden">{i + 1}</span>
                <Play size={12} className="mx-auto hidden fill-slate-400 text-slate-400 group-hover:block" />
              </div>

              <TrackCover track={track} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">{track.title}</p>
                <p className="truncate text-xs text-slate-500">{track.artist} · {track.album}</p>
              </div>

              <SourceBadge track={track} />

              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(track.id) }}
                className={`p-1 opacity-0 transition-all group-hover:opacity-100 ${isLiked ? 'opacity-100 text-violet-400' : 'text-slate-600'}`}
              >
                <Heart size={13} className={isLiked ? 'fill-violet-400' : ''} />
              </button>

              <span className="w-10 flex-shrink-0 text-right font-mono text-[10px] text-slate-600 flex items-center justify-end gap-0.5">
                <Clock size={9} />{formatTime(track.duration)}
              </span>
            </div>
          )
        })}

        {results.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={32} className="mb-3 text-slate-700" />
            {localQuery.trim()
              ? <><p className="text-sm text-slate-500">Sin resultados para "{localQuery}"</p><p className="mt-1 text-xs text-slate-700">Prueba cambiar la fuente o usa otra búsqueda</p></>
              : <p className="text-sm text-slate-600">Escribe algo para buscar en {meta.label}</p>
            }
          </div>
        )}
      </div>
    </div>
  )
}
