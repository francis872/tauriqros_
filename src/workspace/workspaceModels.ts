export type WorkspaceId = 'focus' | 'development' | 'research' | 'ai' | 'creative'

export interface WorkspaceDefinition {
  id: WorkspaceId
  label: string
  description: string
  aura: string
}

export const WORKSPACES: WorkspaceDefinition[] = [
  {
    id: 'focus',
    label: 'Focus',
    description: 'Minimal surface for single-task execution.',
    aura: 'from-cyan-400/35 to-transparent',
  },
  {
    id: 'development',
    label: 'Development',
    description: 'Code windows, terminal, and diagnostics.',
    aura: 'from-violet-400/30 to-transparent',
  },
  {
    id: 'research',
    label: 'Research',
    description: 'Reference-heavy windows and notes collection.',
    aura: 'from-emerald-400/28 to-transparent',
  },
  {
    id: 'ai',
    label: 'AI',
    description: 'Prompt workflows, model routing, and assistants.',
    aura: 'from-cyan-300/30 to-violet-400/20',
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Visual composition and ideation environment.',
    aura: 'from-pink-400/25 to-violet-400/20',
  },
]

export const DEFAULT_WORKSPACE_ID: WorkspaceId = 'focus'
