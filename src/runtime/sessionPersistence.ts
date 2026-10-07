import { useEffect } from 'react'
import { useDesktopStore } from '../store/desktopStore'
import { saveSessionMemory } from '../profiles/profileStorage'
import type { AppWindow } from '../store/desktopStore'

function toPersistedWindow(windowItem: AppWindow) {
  return {
    id: windowItem.id,
    appId: windowItem.appId,
    title: windowItem.title,
    workspaceId: windowItem.workspaceId,
    x: windowItem.x,
    y: windowItem.y,
    width: windowItem.width,
    height: windowItem.height,
    minimized: windowItem.minimized,
    maximized: windowItem.maximized,
    zIndex: windowItem.zIndex,
  }
}

export function restoreDesktopSession() {
  // Disabled automatic window restoration to give users full control over opened windows
  // Previously closed windows will not reappear on restart
  return false
}

export function useDesktopSessionPersistence(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    // Debounce to avoid excessive saves
    let saveTimeout: ReturnType<typeof setTimeout> | null = null
    
    const unsubscribe = useDesktopStore.subscribe((state) => {
      if (saveTimeout) clearTimeout(saveTimeout)
      
      saveTimeout = setTimeout(() => {
        // Only persist non-minimized windows to prevent ghost re-opens
        const openWindows = state.windows.filter(w => !w.minimized && w.zIndex > 0)
        
        saveSessionMemory({
          activeWorkspaceId: state.activeWorkspaceId,
          activeSidebarItem: state.activeSidebarItem,
          windows: openWindows.map(toPersistedWindow),
          focusedWindowId: state.focusedWindowId,
          workspaceSnapshots: state.workspaceSnapshots,
          updatedAt: Date.now(),
        })
      }, 500)
    })

    return () => {
      if (saveTimeout) clearTimeout(saveTimeout)
      unsubscribe()
    }
  }, [enabled])
}
