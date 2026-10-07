import { create } from 'zustand'
import { DEFAULT_WORKSPACE_ID, type WorkspaceId } from '../workspace/workspaceModels'
import { captureWorkspaceSnapshot, type WorkspaceSnapshot } from '../workspace/workspaceOrchestrator'
import type { LayoutPreset } from '../windows/layoutIntelligence'
import { type SnapLayoutId, LAYOUT_TEMPLATES } from '../windows/layoutTemplates'
import {
  distributeWindowsToSlots,
  buildPixelBoundsMap,
  persistLayoutState,
} from '../windows/runtimeSnapEngine'
import { APP_REGISTRY, DEFAULT_DOCK_APPS } from '../apps/registry'

export interface AppWindow {
  id: string
  appId: string
  title: string
  workspaceId: WorkspaceId
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  snap: 'none' | 'left' | 'right' | 'top'
  lastBounds?: { x: number; y: number; width: number; height: number }
  initialPath?: string
  zIndex: number
}

export interface DesktopStore {
  windows: AppWindow[]
  focusedWindowId: string | null
  zCounter: number
  activeWorkspaceId: WorkspaceId
  workspaceSnapshots: Partial<Record<WorkspaceId, WorkspaceSnapshot>>
  layoutPreset: LayoutPreset

  activeSidebarItem: 'home' | 'ai' | 'files' | 'terminal' | 'settings'
  launcherOpen: boolean
  notificationsOpen: boolean
  aiCommandCenterOpen: boolean
  activeLayoutId: SnapLayoutId | null
  pinnedApps: string[]
  dockCollapsed: boolean

  openApp: (appId: string, title: string, width?: number, height?: number, initialPath?: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, width: number, height: number, x?: number, y?: number) => void
  snapWindow: (id: string, zone: AppWindow['snap']) => void
  arrangeSnapLayout: (focusedWindowId: string, layoutId: SnapLayoutId) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  switchWorkspace: (workspaceId: WorkspaceId) => void
  setActiveSidebarItem: (item: DesktopStore['activeSidebarItem']) => void
  setLauncherOpen: (open: boolean) => void
  toggleNotifications: () => void
  setAiCommandCenterOpen: (open: boolean) => void
  setLayoutPreset: (layoutPreset: LayoutPreset) => void
  setActiveLayoutId: (id: SnapLayoutId | null) => void
  pinApp: (appId: string) => void
  unpinApp: (appId: string) => void
  toggleAppPinned: (appId: string) => void
  toggleDockCollapsed: () => void
}

let windowIdCounter = 1

function nextWindowId() {
  windowIdCounter += 1
  return `win-${Date.now()}-${windowIdCounter}`
}

function getWorkspaceTopWindow(windows: AppWindow[], workspaceId: WorkspaceId) {
  return windows
    .filter((windowItem) => windowItem.workspaceId === workspaceId && !windowItem.minimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0]
}

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  windows: [],
  focusedWindowId: null,
  zCounter: 100,
  activeWorkspaceId: DEFAULT_WORKSPACE_ID,
  workspaceSnapshots: {},
  layoutPreset: 'focus-single',
  activeSidebarItem: 'home',
  launcherOpen: false,
  notificationsOpen: false,
  aiCommandCenterOpen: false,
  activeLayoutId: null,
  pinnedApps: [...DEFAULT_DOCK_APPS],
  dockCollapsed: false,

  openApp: (appId, title, width = 720, height = 500, initialPath) => {
    const { windows, zCounter, activeWorkspaceId } = get()
    const resolvedInitialPath = initialPath ?? APP_REGISTRY[appId]?.initialPath
    const existing = windows.find(
      (windowItem) =>
        windowItem.appId === appId
        && windowItem.workspaceId === activeWorkspaceId
        && !windowItem.minimized,
    )
    if (existing) {
      if (resolvedInitialPath) {
        set((state) => ({
          windows: state.windows.map((windowItem) =>
            windowItem.id === existing.id
              ? { ...windowItem, initialPath: resolvedInitialPath }
              : windowItem,
          ),
        }))
      }
      get().focusWindow(existing.id)
      const appRoute = APP_REGISTRY[appId]?.route
      if (typeof window !== 'undefined' && appRoute) {
        window.history.replaceState(null, '', appRoute)
      }
      return
    }
    const minimized = windows.find(
      (windowItem) =>
        windowItem.appId === appId
        && windowItem.workspaceId === activeWorkspaceId
        && windowItem.minimized,
    )
    if (minimized) {
      set((state) => ({
        windows: state.windows.map((windowItem) =>
          windowItem.id === minimized.id
            ? {
                ...windowItem,
                minimized: false,
                zIndex: state.zCounter + 1,
              }
            : windowItem,
        ),
        focusedWindowId: minimized.id,
        zCounter: state.zCounter + 1,
      }))
      return
    }

    const id = nextWindowId()
    const offset = (windows.length % 8) * 28
    const newWindow: AppWindow = {
      id,
      appId,
      title,
      workspaceId: activeWorkspaceId,
      x: 80 + offset,
      y: 60 + offset,
      width,
      height,
      minimized: false,
      maximized: false,
      snap: 'none',
      initialPath: resolvedInitialPath,
      zIndex: zCounter + 1,
    }
    if (typeof window !== 'undefined') {
      const appRoute = APP_REGISTRY[appId]?.route
      if (appRoute) {
        window.history.replaceState(null, '', appRoute)
      }
    }
    set((state) => ({
      windows: [...state.windows, newWindow],
      focusedWindowId: id,
      zCounter: state.zCounter + 1,
    }))
  },

  closeWindow: (id) => {
    set((state) => {
      const remaining = state.windows.filter((windowItem) => windowItem.id !== id)
      const nextTop = getWorkspaceTopWindow(remaining, state.activeWorkspaceId)
      const focused = nextTop
        ? nextTop.id
        : null
      return { windows: remaining, focusedWindowId: focused }
    })
  },

  focusWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((windowItem) =>
        windowItem.id === id
          ? { ...windowItem, zIndex: state.zCounter + 1 }
          : windowItem,
      ),
      focusedWindowId: id,
      zCounter: state.zCounter + 1,
    }))
  },

  moveWindow: (id, x, y) => {
    set((state) => ({
      windows: state.windows.map((windowItem) =>
        windowItem.id === id
          ? {
              ...windowItem,
              x,
              y,
              maximized: false,
              snap: 'none',
            }
          : windowItem,
      ),
    }))
  },

  resizeWindow: (id, width, height, x, y) => {
    set((state) => ({
      windows: state.windows.map((windowItem) =>
        windowItem.id === id
          ? {
              ...windowItem,
              width: Math.max(width, 360),
              height: Math.max(height, 220),
              x: x ?? windowItem.x,
              y: y ?? windowItem.y,
              maximized: false,
              snap: 'none',
            }
          : windowItem,
      ),
    }))
  },

  snapWindow: (id, zone) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight - 48

    set((state) => ({
      windows: state.windows.map((windowItem) => {
        if (windowItem.id !== id) {
          return windowItem
        }

        const lastBounds = windowItem.lastBounds ?? {
          x: windowItem.x,
          y: windowItem.y,
          width: windowItem.width,
          height: windowItem.height,
        }

        if (zone === 'none') {
          return {
            ...windowItem,
            ...lastBounds,
            snap: 'none',
            maximized: false,
          }
        }

        if (zone === 'top') {
          return {
            ...windowItem,
            x: 0,
            y: 0,
            width: viewportWidth,
            height: viewportHeight,
            snap: 'top',
            maximized: true,
            lastBounds,
          }
        }

        return {
          ...windowItem,
          x: zone === 'left' ? 0 : viewportWidth / 2,
          y: 0,
          width: viewportWidth / 2,
          height: viewportHeight,
          snap: zone,
          maximized: false,
          lastBounds,
        }
      }),
    }))
  },

  arrangeSnapLayout: (focusedWindowId, layoutId) => {
    const def = LAYOUT_TEMPLATES[layoutId]
    if (!def) return

    const { windows, activeWorkspaceId } = get()

    // Build assignments using the cognitive snap engine
    const workspaceWindows = windows.filter(
      (w) => w.workspaceId === activeWorkspaceId,
    )
    const assignments = distributeWindowsToSlots(
      workspaceWindows,
      layoutId,
      focusedWindowId,
    )
    const boundsMap = buildPixelBoundsMap(assignments)

    set((state) => ({
      activeLayoutId: layoutId,
      windows: state.windows.map((win) => {
        const bounds = boundsMap.get(win.id)
        if (!bounds) return win
        return {
          ...win,
          lastBounds: { x: win.x, y: win.y, width: win.width, height: win.height },
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          maximized: false,
          snap: boundsMap.get(win.id) ? (win.id === focusedWindowId ? 'left' : 'right') : win.snap,
          minimized: false,
        }
      }),
      focusedWindowId,
    }))

    // Persist layout for workspace continuity
    persistLayoutState({
      layoutId,
      workspaceId: activeWorkspaceId,
      windowIds: assignments.map((a) => a.windowId),
      savedAt: Date.now(),
    })
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((windowItem) =>
        windowItem.id === id
          ? { ...windowItem, minimized: true }
          : windowItem,
      ),
      focusedWindowId: state.focusedWindowId === id
        ? getWorkspaceTopWindow(
            state.windows.filter((windowItem) => windowItem.id !== id),
            state.activeWorkspaceId,
          )?.id ?? null
        : state.focusedWindowId,
    }))
  },

  maximizeWindow: (id) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight - 48

    set((state) => ({
      windows: state.windows.map((windowItem) => {
        if (windowItem.id !== id) {
          return windowItem
        }

        if (!windowItem.maximized) {
          return {
            ...windowItem,
            lastBounds: {
              x: windowItem.x,
              y: windowItem.y,
              width: windowItem.width,
              height: windowItem.height,
            },
            x: 0,
            y: 0,
            width: viewportWidth,
            height: viewportHeight,
            maximized: true,
            snap: 'top',
          }
        }

        return {
          ...windowItem,
          ...(windowItem.lastBounds ?? {
            x: 80,
            y: 60,
            width: 720,
            height: 500,
          }),
          maximized: false,
          snap: 'none',
        }
      }),
    }))
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((windowItem) =>
        windowItem.id === id
          ? { ...windowItem, minimized: false, zIndex: state.zCounter + 1 }
          : windowItem,
      ),
      focusedWindowId: id,
      zCounter: state.zCounter + 1,
    }))
  },

  switchWorkspace: (workspaceId) => {
    set((state) => {
      if (workspaceId === state.activeWorkspaceId) {
        return state
      }

      const currentWorkspaceWindows = state.windows.filter(
        (windowItem) => windowItem.workspaceId === state.activeWorkspaceId && !windowItem.minimized,
      )

      const nextTop = getWorkspaceTopWindow(state.windows, workspaceId)

      return {
        activeWorkspaceId: workspaceId,
        focusedWindowId: nextTop?.id ?? null,
        workspaceSnapshots: {
          ...state.workspaceSnapshots,
          [state.activeWorkspaceId]: captureWorkspaceSnapshot({
            workspaceId: state.activeWorkspaceId,
            openWindowIds: currentWorkspaceWindows.map((windowItem) => windowItem.id),
            focusedWindowId: state.focusedWindowId,
          }),
        },
      }
    })
  },

  setActiveSidebarItem: (item) => set({ activeSidebarItem: item }),
  setLauncherOpen: (open) => set({ launcherOpen: open }),
  toggleNotifications: () => set((state) => ({ notificationsOpen: !state.notificationsOpen })),
  setAiCommandCenterOpen: (open) => set({ aiCommandCenterOpen: open }),
  setLayoutPreset: (layoutPreset) => set({ layoutPreset }),
  setActiveLayoutId: (id) => set({ activeLayoutId: id }),
  pinApp: (appId) => set((state) => ({
    pinnedApps: state.pinnedApps.includes(appId) ? state.pinnedApps : [...state.pinnedApps, appId],
  })),
  unpinApp: (appId) => set((state) => ({
    pinnedApps: state.pinnedApps.filter((id) => id !== appId),
  })),
  toggleAppPinned: (appId) => set((state) => ({
    pinnedApps: state.pinnedApps.includes(appId)
      ? state.pinnedApps.filter((id) => id !== appId)
      : [...state.pinnedApps, appId],
  })),
  toggleDockCollapsed: () => set((state) => ({ dockCollapsed: !state.dockCollapsed })),
}))
