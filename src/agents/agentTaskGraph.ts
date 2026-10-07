export interface AgentTaskNode {
  id: string
  title: string
  status: 'waiting' | 'running' | 'paused' | 'done'
  dependsOn: string[]
}

export function defaultAgentTaskGraph(): AgentTaskNode[] {
  return [
    { id: 'continuity-check', title: 'Continuity checkpoint', status: 'running', dependsOn: [] },
    { id: 'workflow-resume', title: 'Workflow resume scan', status: 'waiting', dependsOn: ['continuity-check'] },
    { id: 'proactive-hints', title: 'Proactive assistance generation', status: 'waiting', dependsOn: ['workflow-resume'] },
  ]
}
