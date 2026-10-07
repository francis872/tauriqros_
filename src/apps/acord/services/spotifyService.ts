import type { Track } from '../acordTypes'

// ── Credentials ─────────────────────────────────────────────────────────────
// Set VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET in .env
const CLIENT_ID     = import.meta.env.VITE_SPOTIFY_CLIENT_ID     as string | undefined
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET as string | undefined

// ── Token cache ──────────────────────────────────────────────────────────────
let _token: string | null = null
let _tokenExpiry = 0

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured. Add VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET to .env')
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`)

  const data = await res.json() as { access_token: string; expires_in: number }
  _token = data.access_token
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return _token
}

// ── Spotify API types ────────────────────────────────────────────────────────
interface SpotifyImage { url: string; height: number; width: number }

interface SpotifyTrack {
  id: string
  name: string
  duration_ms: number
  preview_url: string | null
  artists: Array<{ id: string; name: string }>
  album: {
    id: string
    name: string
    release_date: string
    images: SpotifyImage[]
  }
  explicit: boolean
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
    total: number
  }
}

// ── Gradient palette: assigned from artist name hash ────────────────────────
const GRADIENTS: Array<[string, string]> = [
  ['#7c3aed', '#1e1b4b'],
  ['#0891b2', '#0c4a6e'],
  ['#b45309', '#451a03'],
  ['#1d4ed8', '#172554'],
  ['#be185d', '#4c0519'],
  ['#047857', '#022c22'],
  ['#dc2626', '#450a0a'],
  ['#7c3aed', '#0f172a'],
]

function hashGradient(str: string): [string, string] {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return GRADIENTS[h % GRADIENTS.length]
}

// ── Map Spotify → our Track ──────────────────────────────────────────────────
function mapSpotifyTrack(s: SpotifyTrack): Track {
  const coverUrl = s.album.images[0]?.url
  const year = parseInt(s.album.release_date?.split('-')[0] ?? '2024', 10)

  return {
    id: `sp_${s.id}`,
    title: s.name,
    artist: s.artists.map((a) => a.name).join(', '),
    artistId: `sp_${s.artists[0]?.id ?? 'unknown'}`,
    album: s.album.name,
    albumId: `sp_${s.album.id}`,
    duration: Math.floor(s.duration_ms / 1000),
    genre: 'Spotify',
    moods: [],
    year,
    coverGradient: hashGradient(s.id),
    coverUrl,
    previewUrl: s.preview_url ?? undefined,
    // lyrics and liryqAnalysis are intentionally absent — real tracks
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function spotifySearch(query: string, limit = 20): Promise<Track[]> {
  const token = await getToken()
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=US`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`Spotify search failed: ${res.status}`)

  const data = await res.json() as SpotifySearchResponse
  return data.tracks.items.map(mapSpotifyTrack)
}

export function isSpotifyConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET)
}
