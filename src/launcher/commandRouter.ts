import { APP_REGISTRY } from '../apps/registry'
import type { WorkspaceId } from '../workspace/workspaceModels'

export type LauncherIntentType = 'open-app' | 'switch-workspace' | 'workflow' | 'assistant'

export interface LauncherIntent {
  id: string
  type: LauncherIntentType
  label: string
  subtitle: string
  icon: string
  score: number
  appId?: keyof typeof APP_REGISTRY
  workspaceId?: WorkspaceId
  workflowId?: string
}

const WORKSPACE_TERMS: Record<WorkspaceId, string[]> = {
  focus: ['focus', 'deep', 'single'],
  development: ['dev', 'development', 'coding', 'code'],
  research: ['research', 'study', 'investigate'],
  ai: ['ai', 'assistant', 'prompt'],
  creative: ['creative', 'design', 'compose'],
}

const WORKFLOW_INTENTS: Array<Omit<LauncherIntent, 'score'>> = [
  {
    id: 'workflow:prepare-development-workspace',
    type: 'workflow',
    label: 'Prepare development workspace',
    subtitle: 'Open Files, Terminal, and Monitor with development context',
    icon: 'workflow',
    workflowId: 'prepare-development-workspace',
  },
  {
    id: 'workflow:resume-ai-project',
    type: 'workflow',
    label: 'Resume yesterday AI project',
    subtitle: 'Restore AI workspace, notes, and assistant context',
    icon: 'workflow',
    workflowId: 'resume-ai-project',
  },
  {
    id: 'workflow:open-research-environment',
    type: 'workflow',
    label: 'Open research environment',
    subtitle: 'Load research workspace and contextual files',
    icon: 'activity',
    workflowId: 'open-research-environment',
  },
  {
    id: 'workflow:continue-architecture-session',
    type: 'workflow',
    label: 'Continue startup architecture session',
    subtitle: 'Restore architecture planning workflow state',
    icon: 'activity',
    workflowId: 'continue-architecture-session',
  },
  {
    id: 'workflow:open-cognitive-timeline',
    type: 'workflow',
    label: 'Open cognitive timeline replay',
    subtitle: 'Visualize semantic memory clusters and continuity chain',
    icon: 'activity',
    workflowId: 'open-cognitive-timeline',
  },
  {
    id: 'workflow:run-autonomous-planner',
    type: 'workflow',
    label: 'Run autonomous execution planner',
    subtitle: 'Coordinate multi-agent task chain with runtime context',
    icon: 'workflow',
    workflowId: 'run-autonomous-planner',
  },
  {
    id: 'assistant:contextual',
    type: 'assistant',
    label: 'Ask contextual desktop assistant',
    subtitle: 'Route natural language command to AI layer',
    icon: 'bot',
  },
]

function scoreMatch(query: string, text: string, aliases: string[] = []): number {
  if (!query) {
    return 1
  }

  const normalized = query.toLowerCase()
  const haystack = text.toLowerCase()

  if (haystack === normalized) {
    return 100
  }

  if (haystack.startsWith(normalized)) {
    return 70
  }

  if (haystack.includes(normalized)) {
    return 45
  }

  const aliasScore = aliases.find((alias) => alias.toLowerCase().includes(normalized)) ? 40 : 0
  return aliasScore
}

export function resolveLauncherIntents(query: string): LauncherIntent[] {
  const intents: LauncherIntent[] = []

  Object.values(APP_REGISTRY).forEach((app) => {
    const score = scoreMatch(query, app.label, [app.description, app.id, app.category])

    if (score > 0) {
      intents.push({
        id: `app:${app.id}`,
        type: 'open-app',
        label: `Open ${app.label}`,
        subtitle: app.description,
        icon: app.icon,
        score,
        appId: app.id as keyof typeof APP_REGISTRY,
      })
    }
  })

  ;(Object.keys(WORKSPACE_TERMS) as WorkspaceId[]).forEach((workspaceId) => {
    const aliases = WORKSPACE_TERMS[workspaceId]
    const score = scoreMatch(query, workspaceId, aliases)

    if (score > 0) {
      intents.push({
        id: `workspace:${workspaceId}`,
        type: 'switch-workspace',
        label: `Switch to ${workspaceId[0].toUpperCase()}${workspaceId.slice(1)} workspace`,
        subtitle: `Context-preserving transition to ${workspaceId}`,
        icon: 'layers',
        workspaceId,
        score,
      })
    }
  })

  WORKFLOW_INTENTS.forEach((intent) => {
    const score = scoreMatch(query, intent.label, [intent.subtitle, intent.id])
    if (score > 0) {
      intents.push({ ...intent, score })
    }
  })

  return intents
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
}
