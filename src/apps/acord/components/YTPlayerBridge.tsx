import { useEffect, useRef } from 'react'
import { useAcordStore } from '../acordStore'
import { ytPlayerRef } from '../services/ytPlayerRef'

// Extend window for the YouTube IFrame API
declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: {
          width: string | number
          height: string | number
          playerVars?: Record<string, number | string>
          events?: {
            onReady?: () => void
            onStateChange?: (e: { data: number }) => void
            onError?: (e: { data: number }) => void
          }
        }
      ) => YTInstance
      PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTInstance {
  loadVideoById(videoId: string): void
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  setVolume(v: number): void
  getCurrentTime(): number
  getDuration(): number
  destroy(): void
}

export default function YTPlayerBridge() {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTInstance | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    function initPlayer() {
      if (!containerRef.current || playerRef.current) return

      playerRef.current = new window.YT.Player(containerRef.current, {
        width: '1',
        height: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            ytPlayerRef.set(playerRef.current)
            // Apply current volume
            const vol = useAcordStore.getState().volume
            playerRef.current?.setVolume(Math.round(vol * 100))
          },

          onStateChange: (e) => {
            const store = useAcordStore.getState()
            if (e.data === 0) {
              // ENDED — advance to next track
              store.next()
            } else if (e.data === 1) {
              // PLAYING — sync actual duration now that we know it
              useAcordStore.setState({ isPlaying: true })
              const dur = playerRef.current?.getDuration() ?? 0
              const track = useAcordStore.getState().currentTrack
              if (track?.ytVideoId && dur > 0 && Math.abs(track.duration - Math.floor(dur)) > 2) {
                useAcordStore.setState({ currentTrack: { ...track, duration: Math.floor(dur) } })
              }
            } else if (e.data === 2) {
              useAcordStore.setState({ isPlaying: false })
            }
          },

          onError: () => {
            // Video unavailable — skip to next
            useAcordStore.getState().next()
          },
        },
      })

      // Position sync — update store every 500ms while YT track is playing
      tickRef.current = setInterval(() => {
        const { currentTrack, isPlaying } = useAcordStore.getState()
        if (!currentTrack?.ytVideoId || !isPlaying) return
        const pos = playerRef.current?.getCurrentTime() ?? 0
        if (pos > 0) useAcordStore.setState({ position: pos })
      }, 500)
    }

    // YouTube IFrame API is loaded once globally
    if (window.YT?.Player) {
      initPlayer()
    } else {
      // Queue the init for when the script fires its ready callback
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        initPlayer()
      }

      // Load the script only once
      if (!document.getElementById('yt-iframe-api-script')) {
        const script = document.createElement('script')
        script.id = 'yt-iframe-api-script'
        script.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(script)
      }
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      playerRef.current?.destroy()
      ytPlayerRef.set(null)
      playerRef.current = null
    }
  }, []) // mount once

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -9999,
      }}
    >
      {/* YouTube replaces this div with an <iframe> */}
      <div ref={containerRef} />
    </div>
  )
}
