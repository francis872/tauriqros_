import type { WorkspaceId } from '../workspace/workspaceModels'

export interface UserGoal {
  id: string
  title: string
  completed: boolean
}

export interface AppLayoutSnapshot {
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
  zIndex: number
}

export interface WorkspaceRuntimeSnapshot {
  workspaceId: WorkspaceId
  openWindowIds: string[]
  focusedWindowId: string | null
  capturedAt: number
}

export interface SessionMemorySnapshot {
  activeWorkspaceId: WorkspaceId
  activeSidebarItem: 'home' | 'ai' | 'files' | 'terminal' | 'settings'
  windows: AppLayoutSnapshot[]
  focusedWindowId: string | null
  workspaceSnapshots: Partial<Record<WorkspaceId, WorkspaceRuntimeSnapshot>>
  updatedAt: number
}

export interface UserIdentityProfile {
  id: string
  displayName: string
  role: string
  city: string
  timezone: string
  preferredWorkspace: WorkspaceId
  recentProjects: string[]
  routines: string[]
  goals: UserGoal[]
  createdAt: number
  updatedAt: number
}

export interface EnvironmentWeather {
  condition: 'clear' | 'cloudy' | 'rain' | 'storm'
  temperatureC: number
  humidity: number
  windKmh: number
}
