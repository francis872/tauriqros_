import type { WorkspaceId } from '../workspace/workspaceModels'
import { registerIntent } from '../context/contextEngine'
import type { WorkflowDefinition, WorkflowStep } from '../workflows/workflowEngine'

export interface AutomationRuntimeContext {
  switchWorkspace: (workspaceId: WorkspaceId) => void
  openApp: (appId: string) => void
  notify: (input: { title: string; message: string; tone: 'info' | 'success' | 'warning'; workspaceId?: string }) => void
  activeWorkspaceId: WorkspaceId
}

function executeStep(step: WorkflowStep, context: AutomationRuntimeContext) {
  if (step.action === 'switch-workspace') {
    context.switchWorkspace(step.payload as WorkspaceId)
    return
  }

  if (step.action === 'open-app') {
    context.openApp(step.payload)
    return
  }

  if (step.action === 'notify') {
    context.notify({
      title: 'Workflow Runtime',
      message: step.payload,
      tone: 'success',
      workspaceId: context.activeWorkspaceId,
    })
    return
  }

  if (step.action === 'context-intent') {
    registerIntent({
      message: step.payload,
      workspaceId: context.activeWorkspaceId,
    })
  }
}

export function runAutomationWorkflow(workflow: WorkflowDefinition, context: AutomationRuntimeContext) {
  workflow.steps.forEach((step) => executeStep(step, context))

  context.notify({
    title: 'Automation Complete',
    message: `${workflow.title} completed with ${workflow.steps.length} steps.`,
    tone: 'info',
    workspaceId: context.activeWorkspaceId,
  })
}
