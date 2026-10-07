import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import TauriqBootScreen from './shell/TauriqBootScreen'
import DesktopEnvironment from './desktop/DesktopEnvironment'
import TauriqLoginExperience from './identity/TauriqLoginExperience'
import TauriqLockScreen from './lockscreen/TauriqLockScreen'
import { useSessionRuntime } from './runtime/useSessionRuntime'

type AppPhase = 'boot' | 'login' | 'desktop'

export default function App() {
  const {
    phase,
    setPhase,
    startup,
    locked,
    setLocked,
    runtimeSnapshot,
    presence,
    presenceOpen,
    setPresenceOpen,
  } = useSessionRuntime()
  const [bootPhase, setBootPhase] = useState<AppPhase>('boot')

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('tauriq-shell')

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => undefined)
    }

    return () => {
      root.classList.remove('tauriq-shell')
    }
  }, [])

  return (
    <div className="h-full w-full overflow-hidden bg-[#040506]">
      <AnimatePresence mode="wait">
        {bootPhase === 'boot' && (
          <TauriqBootScreen
            onComplete={() => {
              setBootPhase('login')
              setPhase('login')
            }}
          />
        )}

        {bootPhase !== 'boot' && phase === 'login' && (
          <TauriqLoginExperience
            profile={startup.profile}
            weather={startup.weather}
            activeProjects={startup.activeProjects}
            runtimeSnapshot={runtimeSnapshot}
            onEnterSession={() => setPhase('desktop')}
          />
        )}

        {bootPhase !== 'boot' && phase === 'desktop' && (
          <DesktopEnvironment
            profile={startup.profile}
            presence={presence}
            presenceOpen={presenceOpen}
            runtimeSnapshot={runtimeSnapshot}
            onDismissPresence={() => setPresenceOpen(false)}
            onLockRequest={() => setLocked(true)}
          />
        )}
      </AnimatePresence>

      <TauriqLockScreen
        open={phase === 'desktop' && locked}
        profile={startup.profile}
        weather={startup.weather}
        notifications={presence.length}
        runtimeSnapshot={runtimeSnapshot}
        onUnlock={() => setLocked(false)}
      />
    </div>
  )
}
