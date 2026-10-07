import { useMemo, useState, useEffect } from 'react'
import { bootstrapSessionStartup, getPresenceForStartup } from '../orchestration/sessionOrchestrator'
import { useDesktopSessionPersistence } from './sessionPersistence'
import { selectRecommendedWorkspace } from '../intelligence/workspaceIntelligence'
import { useDesktopStore } from '../store/desktopStore'
import { initializeTauriqSession, type TauriqSessionRuntimeSnapshot } from '../session/tauriqSessionManager'
import { saveContinuitySnapshot } from '../persistence/sessionStateRepository'
import { useRuntimeCoreStore } from './runtimeCoreStore'

export type RuntimePhase = 'boot' | 'login' | 'desktop'

export function useSessionRuntime() {
  const startup = useMemo(() => bootstrapSessionStartup(), [])
  const [phase, setPhase] = useState<RuntimePhase>('boot')
  const [locked, setLocked] = useState(false)
  const [presenceOpen, setPresenceOpen] = useState(true)
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<TauriqSessionRuntimeSnapshot | null>(null)
  const [runtimeReady, setRuntimeReady] = useState(false)

  const switchWorkspace = useDesktopStore((state) => state.switchWorkspace)
  const setCoreSnapshot = useRuntimeCoreStore((state) => state.setCoreSnapshot)

  useEffect(() => {
    let mounted = true

    const loadRuntime = async () => {
      const state = useDesktopStore.getState()
      const restoredWindows = state.windows.filter((windowItem) => !windowItem.minimized).length

      const snapshot = await initializeTauriqSession({
        profile: startup.profile,
        activeWorkspaceId: startup.profile.preferredWorkspace,
        restoredWindows,
      })

      if (!mounted) {
        return
      }

      setRuntimeSnapshot(snapshot)
      setCoreSnapshot(snapshot.core)
      setRuntimeReady(true)
    }

    void loadRuntime()

    return () => {
      mounted = false
    }
  }, [startup.profile, setCoreSnapshot])

  useEffect(() => {
    if (startup.restored) {
      return
    }

    const recommended = selectRecommendedWorkspace(startup.profile, startup.unfinishedGoals)
    switchWorkspace(recommended)
    
    // Clear previous session windows on new session start
    useDesktopStore.setState({ windows: [], focusedWindowId: null })
  }, [startup.profile, startup.restored, startup.unfinishedGoals, switchWorkspace])

  useDesktopSessionPersistence(phase === 'desktop')

  useEffect(() => {
    if (!runtimeSnapshot || phase !== 'desktop') {
      return
    }

    const unsubscribe = useDesktopStore.subscribe((state) => {
      saveContinuitySnapshot({
        ...runtimeSnapshot.continuity,
        lastWorkspaceId: state.activeWorkspaceId,
        workflows: runtimeSnapshot.continuity.workflows.map((workflow) => ({
          ...workflow,
          updatedAt: Date.now(),
        })),
        recentFiles: runtimeSnapshot.continuity.recentFiles,
        updatedAt: Date.now(),
      })
    })

    return () => {
      unsubscribe()
    }
  }, [runtimeSnapshot, phase])

  useEffect(() => {
    const onLockShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
        event.preventDefault()
        setLocked(true)
      }
    }

    window.addEventListener('keydown', onLockShortcut)
    return () => window.removeEventListener('keydown', onLockShortcut)
  }, [])

  return {
    phase,
    setPhase,
    startup,
    locked,
    setLocked,
    runtimeSnapshot,
    runtimeReady,
    presence: getPresenceForStartup(startup),
    presenceOpen,
    setPresenceOpen,
  }
}
