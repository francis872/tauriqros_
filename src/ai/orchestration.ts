export type ModelExecutionTarget = 'local' | 'cloud' | 'hybrid'

export interface ModelProvider {
  id: string
  label: string
  target: ModelExecutionTarget
  availability: 'planned' | 'prototype-ready'
}

export interface WorkflowAction {
  id: string
  title: string
  category: 'files' | 'terminal' | 'session' | 'automation'
}

export const MODEL_PROVIDERS: ModelProvider[] = [
  { id: 'local-gguf', label: 'Local GGUF Runtime', target: 'local', availability: 'planned' },
  { id: 'cloud-openai', label: 'Cloud Provider Gateway', target: 'cloud', availability: 'planned' },
  { id: 'hybrid-router', label: 'Hybrid Model Router', target: 'hybrid', availability: 'prototype-ready' },
]

export const WORKFLOW_ACTIONS: WorkflowAction[] = [
  { id: 'open-terminal', title: 'Open terminal and run command', category: 'terminal' },
  { id: 'index-workspace', title: 'Index workspace context', category: 'files' },
  { id: 'session-status', title: 'Summarize desktop session health', category: 'session' },
  { id: 'start-automation', title: 'Start autonomous workflow plan', category: 'automation' },
]
