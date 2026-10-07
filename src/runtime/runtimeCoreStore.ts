import { create } from 'zustand'
import type { CoreRuntimeSnapshot } from '../core/coreRuntimeOrchestrator'

interface RuntimeCoreStore {
  coreSnapshot: CoreRuntimeSnapshot | null
  updatedAt: number
  heatState: 'stable' | 'warm' | 'hot'
  setCoreSnapshot: (snapshot: CoreRuntimeSnapshot) => void
}

export const useRuntimeCoreStore = create<RuntimeCoreStore>((set) => ({
  coreSnapshot: null,
  updatedAt: 0,
  heatState: 'stable',
  setCoreSnapshot: (snapshot) => set({
    coreSnapshot: snapshot,
    updatedAt: Date.now(),
    heatState: snapshot.nativeExecution.gpu.telemetry.utilization > 85
      ? 'hot'
      : snapshot.nativeExecution.gpu.telemetry.utilization > 65
        ? 'warm'
        : 'stable',
  }),
}))
