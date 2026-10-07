/**
 * Workflow Habit Memory — Phase 11
 * Persistent storage for behavioral habit data across TAURIQ sessions.
 * Uses localStorage with a versioned key for session continuity.
 */

import type { HabitPatternGraph } from './habitPatternGraph'
import { createHabitPatternGraph } from './habitPatternGraph'

const HABIT_MEMORY_KEY = 'tauriq:habit-memory.v1'

export interface WorkflowHabitMemory {
  graph: HabitPatternGraph
  sessionCount: number
  lastSessionAt: number
  topWorkflows: string[]
  aiQueryCount: number
  layoutChangeCount: number
}

export function loadWorkflowHabitMemory(): WorkflowHabitMemory {
  try {
    const raw = localStorage.getItem(HABIT_MEMORY_KEY)
    if (raw) return JSON.parse(raw) as WorkflowHabitMemory
  } catch { /* browser storage may be unavailable */ }
  return {
    graph: createHabitPatternGraph(),
    sessionCount: 0,
    lastSessionAt: Date.now(),
    topWorkflows: [],
    aiQueryCount: 0,
    layoutChangeCount: 0,
  }
}

export function persistWorkflowHabitMemory(mem: WorkflowHabitMemory): void {
  try {
    localStorage.setItem(HABIT_MEMORY_KEY, JSON.stringify(mem))
  } catch { /* ignore storage errors */ }
}

export function mergeHabitSignal(
  mem: WorkflowHabitMemory,
  type: 'ai-query' | 'layout-change' | 'workflow',
  label?: string,
): WorkflowHabitMemory {
  const updated = { ...mem }
  if (type === 'ai-query') updated.aiQueryCount++
  if (type === 'layout-change') updated.layoutChangeCount++
  if (type === 'workflow' && label && !updated.topWorkflows.includes(label)) {
    updated.topWorkflows = [label, ...updated.topWorkflows].slice(0, 10)
  }
  return updated
}
