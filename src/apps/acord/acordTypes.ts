export interface LyricLine {
  time: number
  text: string
}

export interface LiryqTranslations {
  en: string[]
  fr: string[]
  pt: string[]
}

export interface LiryqAnalysis {
  mood: string
  moodColor: string
  themes: string[]
  emotionalArc: string
  culturalContext: string
  significance: string
  generatedVerse: string
  translations: LiryqTranslations
}

export interface Track {
  id: string
  title: string
  artist: string
  artistId: string
  album: string
  albumId: string
  duration: number
  genre: string
  moods: string[]
  year: number
  coverGradient: [string, string]
  /** URL to album art image (Spotify/YouTube/Jamendo tracks). Overrides coverGradient when present. */
  coverUrl?: string
  /** 30-second preview MP3 URL (Spotify) or full MP3 URL (Jamendo) */
  previewUrl?: string
  /** YouTube video ID — played via YTPlayerBridge (full song) */
  ytVideoId?: string
  /** Synced lyric lines — only available on mock/local tracks */
  lyrics?: LyricLine[]
  /** Liryq AI analysis — only available on mock/local tracks */
  liryqAnalysis?: LiryqAnalysis
}

export interface Artist {
  id: string
  name: string
  genre: string
  monthlyListeners: number
  color: string
}

export interface Album {
  id: string
  title: string
  artistId: string
  artistName: string
  year: number
  trackIds: string[]
  gradient: [string, string]
}

export interface Playlist {
  id: string
  title: string
  description: string
  trackIds: string[]
  color: string
}
