import { useEffect } from 'react'

interface LauncherShortcutsOptions {
  onOpenLauncher: () => void
  onCloseLauncher: () => void
  onOpenAsciiSearch?: () => void
}

export function useLauncherShortcuts({ onOpenLauncher, onCloseLauncher, onOpenAsciiSearch }: LauncherShortcutsOptions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault()
        onOpenLauncher()
      }

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === 'a') {
        event.preventDefault()
        onOpenAsciiSearch?.()
      }

      if (event.altKey && event.code === 'Space') {
        event.preventDefault()
        onOpenLauncher()
      }

      if (event.key === 'Escape') {
        onCloseLauncher()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCloseLauncher, onOpenLauncher])
}
