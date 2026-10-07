import type { Track } from '../acordTypes'

// ── Credentials ──────────────────────────────────────────────────────────────
// Free at: https://console.developers.google.com → Enable "YouTube Data API v3"
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined

// ── Types ────────────────────────────────────────────────────────────────────
interface YTItem {
  id: { videoId: string }
  snippet: {
    title: string
    channelTitle: string
    publishedAt: string
    thumbnails: {
      medium?: { url: string }
      high?: { url: string }
    }
  }
}

// ── Gradient fallback palette ─────────────────────────────────────────────────
const GRADS: Array<[string, string]> = [
  ['#dc2626', '#7f1d1d'],
  ['#ea580c', '#431407'],
  ['#7c3aed', '#1e1b4b'],
  ['#1d4ed8', '#172554'],
  ['#047857', '#022c22'],
]

function hashGrad(str: string): [string, string] {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return GRADS[h % GRADS.length]
}

// Clean up YouTube title into a nicer song title
function cleanTitle(raw: string): string {
  return raw
    .replace(/\s*\(Official\s*(Music\s*)?Video\)/gi, '')
    .replace(/\s*\(Official\s*(Audio|Lyric\s*Video|Visualizer)\)/gi, '')
    .replace(/\s*\|\s*Official.*$/gi, '')
    .replace(/\s*-\s*Official\s*(Audio|Video|Music Video).*$/gi, '')
    .replace(/\s*\[Official.*?\]/gi, '')
    .trim()
}

// ── Public API ────────────────────────────────────────────────────────────────
export function isYouTubeConfigured(): boolean {
  return Boolean(API_KEY)
}

export async function youtubeSearch(query: string, limit = 20): Promise<Track[]> {
  if (!API_KEY) throw new Error('VITE_YOUTUBE_API_KEY no configurada en .env')

  // Add "official audio" to bias results toward music
  const q = encodeURIComponent(`${query} official audio`)
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&videoCategoryId=10&maxResults=${limit}&key=${API_KEY}`

  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `YouTube API error ${res.status}`)
  }

  const data = await res.json() as { items: YTItem[] }

  return (data.items ?? []).map((item): Track => {
    const thumb = item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url
    const artist = item.snippet.channelTitle
      .replace(/ - Topic$/i, '')
      .replace(/VEVO$/i, '')
      .trim()

    return {
      id: `yt_${item.id.videoId}`,
      title: cleanTitle(item.snippet.title),
      artist,
      artistId: `yt_${artist}`,
      album: 'YouTube',
      albumId: 'yt',
      duration: 240, // Placeholder; YTPlayerBridge updates it once the video loads
      genre: 'YouTube',
      moods: [],
      year: new Date(item.snippet.publishedAt).getFullYear(),
      coverGradient: hashGrad(item.id.videoId),
      coverUrl: thumb,
      ytVideoId: item.id.videoId,
    }
  })
}
