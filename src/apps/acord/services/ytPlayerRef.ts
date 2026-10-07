// Shared mutable reference to the YouTube IFrame player instance.
// Lives outside React to avoid dependency cycles between the store and the bridge component.

export interface YTPlayerAPI {
  loadVideoById(videoId: string): void
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  setVolume(volume: number): void  // 0–100
  getCurrentTime(): number
  getDuration(): number
}

let _player: YTPlayerAPI | null = null

export const ytPlayerRef = {
  get: (): YTPlayerAPI | null => _player,
  set: (p: YTPlayerAPI | null): void => { _player = p },
}
