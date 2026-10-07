import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskCategory = 'personal' | 'work' | 'health' | 'learning' | 'finance'

export interface BalanceTask {
  id: string
  title: string
  priority: TaskPriority
  category: TaskCategory
  status: TaskStatus
  dueDate?: string
  createdAt: number
  completedAt?: number
  movedAt: number
  okrId?: string
}

export interface OKR {
  id: string
  objective: string
  keyResults: string[]
  createdAt: number
}

export interface ExecutionMove {
  taskId: string
  from: TaskStatus
  to: TaskStatus
  points: number
  movedAt: number
}

// ─── Points config ─────────────────────────────────────────────────────────────

export const MOVE_POINTS: Record<string, number> = {
  'todo→in-progress': 5,
  'in-progress→review': 15,
  'review→done': 30,
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export interface BalanceState {
  tasks: BalanceTask[]
  okrs: OKR[]
  moves: ExecutionMove[]
  totalPoints: number
  todayPoints: number
  lastDayReset: string

  // Actions
  addTask: (task: Omit<BalanceTask, 'id' | 'createdAt' | 'movedAt'>) => void
  moveTask: (taskId: string, to: TaskStatus) => void
  completeTask: (taskId: string) => void
  deleteTask: (taskId: string) => void
  addOKR: (objective: string, keyResults: string[]) => void
  deleteOKR: (okrId: string) => void
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export const useBalanceStore = create<BalanceState>()(
  persist(
    (set, get) => ({
      tasks: [],
      okrs: [],
      moves: [],
      totalPoints: 0,
      todayPoints: 0,
      lastDayReset: todayKey(),

      addTask(partial) {
        const now = Date.now()
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              ...partial,
              id: uid(),
              createdAt: now,
              movedAt: now,
            },
          ],
        }))
      },

      moveTask(taskId, to) {
        const state = get()
        const task = state.tasks.find((t) => t.id === taskId)
        if (!task || task.status === to) return

        const key = `${task.status}→${to}`
        const points = MOVE_POINTS[key] ?? 0

        // Reset today points if new day
        const today = todayKey()
        const dayReset = state.lastDayReset !== today

        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: to, movedAt: Date.now(), completedAt: to === 'done' ? Date.now() : t.completedAt }
              : t,
          ),
          moves: [
            ...s.moves,
            { taskId, from: task.status, to, points, movedAt: Date.now() },
          ],
          totalPoints: s.totalPoints + points,
          todayPoints: dayReset ? points : s.todayPoints + points,
          lastDayReset: today,
        }))
      },

      completeTask(taskId) {
        get().moveTask(taskId, 'done')
      },

      deleteTask(taskId) {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }))
      },

      addOKR(objective, keyResults) {
        set((s) => ({
          okrs: [
            ...s.okrs,
            { id: uid(), objective, keyResults, createdAt: Date.now() },
          ],
        }))
      },

      deleteOKR(okrId) {
        set((s) => ({
          okrs: s.okrs.filter((o) => o.id !== okrId),
          tasks: s.tasks.map((t) => (t.okrId === okrId ? { ...t, okrId: undefined } : t)),
        }))
      },
    }),
    { name: 'balance-store.v1' },
  ),
)

// ─── Derived selectors ─────────────────────────────────────────────────────────

export function selectTasksByStatus(tasks: BalanceTask[], status: TaskStatus) {
  return tasks.filter((t) => t.status === status)
}

export function selectCompletionRate(tasks: BalanceTask[]) {
  if (!tasks.length) return 0
  return Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)
}

export function selectAttentionIndex(tasks: BalanceTask[]) {
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length
  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'done') return false
    return new Date(t.dueDate) < new Date()
  }).length
  return Math.max(0, 100 - inProgress * 10 - overdue * 15)
}

export function selectConsistency(moves: ExecutionMove[]) {
  if (!moves.length) return 0
  const days = new Set(moves.map((m) => new Date(m.movedAt).toISOString().slice(0, 10)))
  return Math.min(100, Math.round((days.size / 7) * 100))
}

export function selectAvgTime(tasks: BalanceTask[]) {
  const completed = tasks.filter((t) => t.status === 'done' && t.completedAt)
  if (!completed.length) return null
  const avg = completed.reduce((s, t) => s + (t.completedAt! - t.createdAt), 0) / completed.length
  const hours = Math.round(avg / 1000 / 60 / 60)
  return hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`
}

export function selectOKRRate(tasks: BalanceTask[], okrs: OKR[]) {
  if (!okrs.length) return 0
  const linked = tasks.filter((t) => t.okrId && t.status === 'done').length
  return tasks.filter((t) => t.status === 'done').length
    ? Math.round((linked / tasks.filter((t) => t.status === 'done').length) * 100)
    : 0
}
