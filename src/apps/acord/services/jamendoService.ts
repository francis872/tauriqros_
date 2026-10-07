import type { Track } from '../acordTypes'

// ── Jamendo free music API ────────────────────────────────────────────────────
// Jamendo hosts 600,000+ Creative Commons / open-license tracks.
// Full MP3 streams, no payment, no DRM, CORS-enabled.
// Register your own client_id (free) at https://devportal.jamendo.com
// The default below is Jamendo's public demo client_id.

const CLIENT_ID = (import.meta.env.VITE_JAMENDO_CLIENT_ID as string | undefined) ?? 'b6747d04'

const BASE = 'https://api.jamendo.com/v3.0'

// ── Types ─────────────────────────────────────────────────────────────────────
interface JamendoTrack {
  id: string
  name: string
  duration: number
  artist_name: string
  artist_id: string
  album_name: string
  album_id: string
  releasedate: string
  audio: string        // direct MP3 stream URL
  image: string        // album art URL
  musicinfo?: {
    tags?: { genres?: string[]; vartags?: string[] }
  }
}

interface JamendoResponse {
  results: JamendoTrack[]
}

// ── Gradient palette ──────────────────────────────────────────────────────────
const GRADS: Array<[string, string]> = [
  ['#0891b2', '#0c4a6e'],
  ['#7c3aed', '#1e1b4b'],
  ['#047857', '#022c22'],
  ['#b45309', '#451a03'],
  ['#be185d', '#4c0519'],
]
function hashGrad(id: string): [string, string] {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return GRADS[h % GRADS.length]
}

// ── Public API ─────────────────────────────────────────────────────────────────
export async function jamendoSearch(query: string, limit = 20): Promise<Track[]> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    format: 'json',
    limit: String(limit),
    search: query,
    include: 'musicinfo',
    imagesize: '200',
    audioformat: 'mp32',   // MP3 192kbps
    boost: 'popularity_month',
  })

  const res = await fetch(`${BASE}/tracks/?${params}`)
  if (!res.ok) throw new Error(`Jamendo API error: ${res.status}`)

  const data = await res.json() as JamendoResponse
  if (!data.results) return []

  return data.results
    .filter((t) => Boolean(t.audio)) // only tracks with a stream URL
    .map((t): Track => {
      const genres = t.musicinfo?.tags?.genres ?? []
      const year = parseInt(t.releasedate?.split('-')[0] ?? '2024', 10)

      return {
        id: `jm_${t.id}`,
        title: t.name,
        artist: t.artist_name,
        artistId: `jm_${t.artist_id}`,
        album: t.album_name,
        albumId: `jm_${t.album_id}`,
        duration: t.duration,
        genre: genres[0] ?? 'Jamendo',
        moods: [],
        year,
        coverGradient: hashGrad(t.id),
        coverUrl: t.image || undefined,
        previewUrl: t.audio,  // Jamendo gives full streams — reusing previewUrl field
      }
    })
}

// Tag-based browsing (genres)
export async function jamendoByGenre(genre: string, limit = 20): Promise<Track[]> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    format: 'json',
    limit: String(limit),
    tags: genre,
    imagesize: '200',
    audioformat: 'mp32',
    boost: 'popularity_month',
  })

  const res = await fetch(`${BASE}/tracks/?${params}`)
  if (!res.ok) throw new Error(`Jamendo API error: ${res.status}`)
  const data = await res.json() as JamendoResponse
  return (data.results ?? [])
    .filter((t) => Boolean(t.audio))
    .map((t): Track => ({
      id: `jm_${t.id}`,
      title: t.name,
      artist: t.artist_name,
      artistId: `jm_${t.artist_id}`,
      album: t.album_name,
      albumId: `jm_${t.album_id}`,
      duration: t.duration,
      genre,
      moods: [],
      year: parseInt(t.releasedate?.split('-')[0] ?? '2024', 10),
      coverGradient: hashGrad(t.id),
      coverUrl: t.image || undefined,
      previewUrl: t.audio,
    }))
}
