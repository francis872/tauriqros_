import { create } from 'zustand'
import { TRACKS, PLAYLISTS } from './acordMockData'
import type { Track, Playlist } from './acordTypes'
import { ytPlayerRef } from './services/ytPlayerRef'

export type AcordView = 'home' | 'search' | 'library' | 'explore' | 'liryq'
export type LiryqLang = 'es' | 'en' | 'fr' | 'pt'

// ── Singleton audio element (module-level, outside React/Zustand) ────────────
let _audio: HTMLAudioElement | null = null

function teardownAudio() {
  if (_audio) {
    _audio.pause()
    _audio.src = ''
    _audio.onended = null
    _audio.ontimeupdate = null
    _audio = null
  }
}

interface AcordStore {
  currentTrack: Track | null
  isPlaying: boolean
  position: number
  volume: number
  shuffle: boolean
  repeat: 'none' | 'one' | 'all'
  queue: Track[]
  likedTrackIds: string[]
  playlists: Playlist[]
  activeView: AcordView
  searchQuery: string
  liryqLang: LiryqLang
  showGeneratedVerse: boolean

  play: (track: Track) => void
  pause: () => void
  resume: () => void
  next: () => void
  prev: () => void
  seek: (position: number) => void
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  toggleLike: (trackId: string) => void
  setView: (view: AcordView) => void
  setSearchQuery: (query: string) => void
  setLiryqLang: (lang: LiryqLang) => void
  toggleGeneratedVerse: () => void
  /** Called every second by AcordApp for mock tracks without previewUrl */
  tick: () => void
}

export const useAcordStore = create<AcordStore>((set, get) => ({
  currentTrack: TRACKS[0],
  isPlaying: false,
  position: 0,
  volume: 0.8,
  shuffle: false,
  repeat: 'none',
  queue: [...TRACKS],
  likedTrackIds: ['t1', 't5'],
  playlists: [...PLAYLISTS],
  activeView: 'home',
  searchQuery: '',
  liryqLang: 'es',
  showGeneratedVerse: false,

  play: (track) => {
    teardownAudio()
    set({ currentTrack: track, isPlaying: false, position: 0, showGeneratedVerse: false })

    if (track.ytVideoId) {
      // ── Full song via YouTube IFrame player ─────────────────────────────────
      const yt = ytPlayerRef.get()
      if (yt) {
        yt.loadVideoById(track.ytVideoId)
        yt.setVolume(Math.round(get().volume * 100))
        // isPlaying = true will be set by onStateChange PLAYING event
      } else {
        // Bridge not ready yet — mark playing optimistically; bridge will sync
        set({ isPlaying: true })
      }
    } else if (track.previewUrl) {
      // ── HTML5 Audio: Spotify 30s preview or Jamendo full MP3 ───────────────
      _audio = new Audio(track.previewUrl)
      _audio.volume = get().volume
      _audio.ontimeupdate = () => {
        if (_audio) set({ position: _audio.currentTime })
      }
      _audio.onended = () => get().next()
      _audio.play()
        .then(() => set({ isPlaying: true }))
        .catch(() => set({ isPlaying: false }))
    } else {
      // ── Mock track: simulated playback via tick() ──────────────────────────
      set({ isPlaying: true, position: 0 })
    }
  },

  pause: () => {
    _audio?.pause()
    ytPlayerRef.get()?.pauseVideo()
    set({ isPlaying: false })
  },

  resume: () => {
    if (_audio) {
      _audio.play().catch(() => {})
    } else if (get().currentTrack?.ytVideoId) {
      ytPlayerRef.get()?.playVideo()
    }
    set({ isPlaying: true })
  },

  next: () => {
    const { queue, currentTrack, shuffle, repeat } = get()
    if (!currentTrack) return
    let nextTrack: Track | undefined

    if (shuffle) {
      const others = queue.filter((t) => t.id !== currentTrack.id)
      nextTrack = others[Math.floor(Math.random() * others.length)]
    } else {
      const idx = queue.findIndex((t) => t.id === currentTrack.id)
      nextTrack = queue[idx + 1] ?? (repeat === 'all' ? queue[0] : undefined)
    }

    if (nextTrack) get().play(nextTrack)
    else set({ isPlaying: false, position: 0 })
  },

  prev: () => {
    const { queue, currentTrack, position } = get()
    if (!currentTrack) return
    if (position > 4) {
      if (_audio) _audio.currentTime = 0
      set({ position: 0 })
      return
    }
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const prevTrack = queue[Math.max(0, idx - 1)]
    get().play(prevTrack)
  },

  seek: (position) => {
    if (_audio) _audio.currentTime = position
    else if (get().currentTrack?.ytVideoId) ytPlayerRef.get()?.seekTo(position, true)
    set({ position })
  },

  setVolume: (volume) => {
    if (_audio) _audio.volume = volume
    ytPlayerRef.get()?.setVolume(Math.round(volume * 100))
    set({ volume })
  },

  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

  toggleRepeat: () =>
    set((state) => ({
      repeat: state.repeat === 'none' ? 'all' : state.repeat === 'all' ? 'one' : 'none',
    })),

  toggleLike: (trackId) =>
    set((state) => ({
      likedTrackIds: state.likedTrackIds.includes(trackId)
        ? state.likedTrackIds.filter((id) => id !== trackId)
        : [...state.likedTrackIds, trackId],
    })),

  setView: (view) => set({ activeView: view }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setLiryqLang: (lang) => set({ liryqLang: lang }),

  toggleGeneratedVerse: () => set((state) => ({ showGeneratedVerse: !state.showGeneratedVerse })),

  // Only used for mock tracks (no previewUrl, no ytVideoId). Real tracks drive position via their own events.
  tick: () => {
    const { currentTrack, isPlaying, position, repeat } = get()
    if (!isPlaying || !currentTrack || currentTrack.previewUrl || currentTrack.ytVideoId) return

    const newPos = position + 1
    if (newPos >= currentTrack.duration) {
      if (repeat === 'one') {
        set({ position: 0 })
      } else {
        get().next()
      }
    } else {
      set({ position: newPos })
    }
  },
}))

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
