/**
 * Runtime Command Graph — Phase 11
 * Static graph of all commands executable via the neural command layer.
 * Each node is an action the system can perform in response to natural language.
 */

export type CommandCategory =
  | 'workspace'
  | 'layout'
  | 'runtime'
  | 'ai'
  | 'recovery'
  | 'navigation'
  | 'optimization'

export interface CommandNode {
  id: string
  label: string
  category: CommandCategory
  patterns: string[]
  requiresConfirmation: boolean
  isDestructive: boolean
  description: string
}

export const RUNTIME_COMMAND_GRAPH: CommandNode[] = [
  {
    id: 'restore-workspace',
    label: 'Restore Workspace',
    category: 'workspace',
    patterns: ['restore workspace', 'resume session', 'reload context', "restore yesterday's"],
    requiresConfirmation: false,
    isDestructive: false,
    description: 'Restore the previous workspace state from continuity checkpoint',
  },
  {
    id: 'optimize-runtime',
    label: 'Optimize Runtime',
    category: 'optimization',
    patterns: ['optimize runtime', 'optimize performance', 'reduce load', 'clean up'],
    requiresConfirmation: false,
    isDestructive: false,
    description: 'Run resource pressure mitigations and rebalance inference queue',
  },
  {
    id: 'focus-research-mode',
    label: 'Research Mode',
    category: 'layout',
    patterns: ['focus research', 'research mode', 'enter research', 'start research'],
    requiresConfirmation: false,
    isDestructive: false,
    description: 'Apply the Research cognitive layout and switch workspace context',
  },
  {
    id: 'open-ai-stack',
    label: 'Open AI Dev Stack',
    category: 'workspace',
    patterns: ['open ai stack', 'open development stack', 'ai dev mode', 'open my ai'],
    requiresConfirmation: false,
    isDestructive: false,
    description: 'Open AI App, Monitor, and Terminal in cognitive layout',
  },
  {
    id: 'resume-workflows',
    label: 'Resume Workflows',
    category: 'workspace',
    patterns: ['resume workflow', 'continue workflow', 'resume interrupted', 'resume tasks'],
    requiresConfirmation: false,
    isDestructive: false,
    description: 'Resume all paused or interrupted workflows from planner queue',
  },
  {
    id: 'show-degraded',
    label: 'Show Degraded Services',
    category: 'runtime',
    patterns: ['show degraded', 'degraded services', 'show health', 'system health', 'what is broken'],
    requiresConfirmation: false,
    isDestructive: false,
    description: 'Display all subsystems with degraded or critical stability status',
  },
  {
    id: 'switch-workspace',
    label: 'Switch Workspace',
    category: 'navigation',
    patterns: ['switch workspace', 'go to workspace', 'open workspace', 'change workspace'],
    requiresConfirmation: false,
    isDestructive: false,
    description: 'Switch to a named workspace by label or ID',
  },
  {
    id: 'ai-focus-mode',
    label: 'AI Focus Mode',
    category: 'layout',
    patterns: ['ai focus', 'focus mode', 'deep work', 'focus layout'],
    requiresConfirmation: false,
    isDestructive: false,
    description: 'Apply the AI-Focus cognitive layout for deep work sessions',
  },
]

export function findCommandByText(text: string): CommandNode | null {
  const lower = text.toLowerCase()
  return RUNTIME_COMMAND_GRAPH.find((cmd) =>
    cmd.patterns.some((p) => lower.includes(p)),
  ) ?? null
}
