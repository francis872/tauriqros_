export type WorkflowId =
  | 'prepare-development-workspace'
  | 'resume-ai-project'
  | 'open-research-environment'
  | 'continue-architecture-session'
  | 'open-cognitive-timeline'
  | 'run-autonomous-planner'

export interface WorkflowStep {
  id: string
  action: 'switch-workspace' | 'open-app' | 'notify' | 'context-intent'
  payload: string
}

export interface WorkflowDefinition {
  id: WorkflowId
  title: string
  description: string
  steps: WorkflowStep[]
}

export const WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: 'prepare-development-workspace',
    title: 'Prepare development workspace',
    description: 'Open development tooling and restore coding context.',
    steps: [
      { id: 'step-1', action: 'switch-workspace', payload: 'development' },
      { id: 'step-2', action: 'open-app', payload: 'files' },
      { id: 'step-3', action: 'open-app', payload: 'terminal' },
      { id: 'step-4', action: 'open-app', payload: 'monitor' },
      { id: 'step-5', action: 'notify', payload: 'Development environment ready.' },
    ],
  },
  {
    id: 'resume-ai-project',
    title: 'Resume yesterday AI project',
    description: 'Return to AI workspace and restore helper applications.',
    steps: [
      { id: 'step-1', action: 'switch-workspace', payload: 'ai' },
      { id: 'step-2', action: 'open-app', payload: 'ai' },
      { id: 'step-3', action: 'open-app', payload: 'notes' },
      { id: 'step-4', action: 'notify', payload: 'AI workspace restored.' },
    ],
  },
  {
    id: 'open-research-environment',
    title: 'Open research environment',
    description: 'Prepare research workspace and notes.',
    steps: [
      { id: 'step-1', action: 'switch-workspace', payload: 'research' },
      { id: 'step-2', action: 'open-app', payload: 'files' },
      { id: 'step-3', action: 'open-app', payload: 'notes' },
      { id: 'step-4', action: 'notify', payload: 'Research environment ready.' },
    ],
  },
  {
    id: 'continue-architecture-session',
    title: 'Continue startup architecture session',
    description: 'Restore architecture planning tooling and AI companion.',
    steps: [
      { id: 'step-1', action: 'switch-workspace', payload: 'development' },
      { id: 'step-2', action: 'open-app', payload: 'terminal' },
      { id: 'step-3', action: 'open-app', payload: 'notes' },
      { id: 'step-4', action: 'open-app', payload: 'ai' },
      { id: 'step-5', action: 'context-intent', payload: 'Continue launcher architecture work?' },
    ],
  },
  {
    id: 'open-cognitive-timeline',
    title: 'Open cognitive timeline replay',
    description: 'Visualize semantic memory continuity and runtime history.',
    steps: [
      { id: 'step-1', action: 'switch-workspace', payload: 'research' },
      { id: 'step-2', action: 'open-app', payload: 'timeline' },
      { id: 'step-3', action: 'open-app', payload: 'monitor' },
      { id: 'step-4', action: 'notify', payload: 'Cognitive timeline replay is active.' },
    ],
  },
  {
    id: 'run-autonomous-planner',
    title: 'Run autonomous execution planner',
    description: 'Coordinate planner, monitor, and AI command center for next actions.',
    steps: [
      { id: 'step-1', action: 'switch-workspace', payload: 'ai' },
      { id: 'step-2', action: 'open-app', payload: 'monitor' },
      { id: 'step-3', action: 'open-app', payload: 'ai' },
      { id: 'step-4', action: 'notify', payload: 'Autonomous planner chain initialized.' },
    ],
  },
]

export function resolveWorkflowByText(query: string): WorkflowDefinition | null {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return null
  }

  return WORKFLOW_DEFINITIONS.find((workflow) => (
    workflow.title.toLowerCase().includes(normalized)
    || workflow.description.toLowerCase().includes(normalized)
    || workflow.id.toLowerCase().includes(normalized)
  )) ?? null
}
