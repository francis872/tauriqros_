import { AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'
import Window from './Window'
import { APP_REGISTRY } from '../apps/registry'

export default function WindowManager() {
  const windows = useDesktopStore((state) => state.windows)
  const activeWorkspaceId = useDesktopStore((state) => state.activeWorkspaceId)
  const orderedWindows = [...windows]
    .filter((windowItem) => windowItem.workspaceId === activeWorkspaceId && !windowItem.minimized)
    .sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
      {orderedWindows.map((win) => {
        const app = APP_REGISTRY[win.appId]
        if (!app) return null
        const AppComponent = app.component
        return (
          <div key={win.id} className="pointer-events-auto">
            <Window win={win}>
              <AppComponent windowId={win.id} initialPath={win.initialPath} />
            </Window>
          </div>
        )
      })}
      </AnimatePresence>
    </div>
  )
}
