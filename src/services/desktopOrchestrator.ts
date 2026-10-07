import { desktopEventBus } from './desktopEventBus'
import type { WorkspaceId } from '../workspace/workspaceModels'
import { runAutomationWorkflow } from '../automation/automationEngine'
import { resolveWorkflowByText, WORKFLOW_DEFINITIONS, type WorkflowDefinition } from '../workflows/workflowEngine'
import { invokeNativeSafe } from './tauriBridge'

export interface DesktopWorkflowContext {
  openApp: (appId: string) => void
  switchWorkspace: (workspaceId: WorkspaceId) => void
  openLauncher: () => void
  openAiCenter: () => void
  notify: (input: { title: string; message: string; tone: 'info' | 'success' | 'warning'; workspaceId?: string }) => void
  activeWorkspaceId: WorkspaceId
}

function resolveWorkflow(workflowId: string): WorkflowDefinition | null {
  const byId = WORKFLOW_DEFINITIONS.find((workflow) => workflow.id === workflowId)
  if (byId) {
    return byId
  }

  if (workflowId === 'prepare-coding') {
    return WORKFLOW_DEFINITIONS.find((workflow) => workflow.id === 'prepare-development-workspace') ?? null
  }

  if (workflowId === 'analyze-session') {
    return WORKFLOW_DEFINITIONS.find((workflow) => workflow.id === 'continue-architecture-session') ?? null
  }

  return resolveWorkflowByText(workflowId)
}

export function createDesktopOrchestrator(context: DesktopWorkflowContext) {
  const runWorkflow = async (workflowId: string) => {
    const workflow = resolveWorkflow(workflowId)

    if (!workflow) {
      context.notify({
        title: 'Workflow Runtime',
        message: `No workflow matched for: ${workflowId}`,
        tone: 'warning',
      })
      context.openLauncher()
      return
    }

    runAutomationWorkflow(workflow, {
      switchWorkspace: context.switchWorkspace,
      openApp: context.openApp,
      notify: context.notify,
      activeWorkspaceId: context.activeWorkspaceId,
    })

    await invokeNativeSafe(
      'automation_run_workflow',
      { workflowId: workflow.id },
      () => Promise.resolve({ status: 'fallback' }),
    )

    context.notify({
      title: 'Automation Runtime',
      message: `${workflow.title} executed via ${'__TAURI_INTERNALS__' in window ? 'native' : 'web fallback'} runtime.`,
      tone: 'info',
      workspaceId: context.activeWorkspaceId,
    })
  }

  const runSystemAction = async (action:
    | 'shutdown'
    | 'restart'
    | 'suspend'
    | 'lock'
    | 'logout'
    | 'audio'
    | 'brightness'
    | 'wifi'
    | 'bluetooth'
    | 'battery'
    | 'updates'
    | 'notifications') => {
    const result = await invokeNativeSafe<{ status: string }>(
      'system_control_execute',
      { action },
      () => ({ status: 'queued-fallback' }),
    )

    context.notify({
      title: 'System Control',
      message: `${action} action ${result.status}.`,
      tone: 'info',
      workspaceId: context.activeWorkspaceId,
    })
  }

  return {
    runWorkflow,
    runSystemAction,
    emit(eventName: 'workflow:trigger' | 'app:open' | 'workspace:switch', payload: unknown) {
      if (eventName === 'workflow:trigger') {
        desktopEventBus.emit(eventName, payload as { workflowId: string })
      }

      if (eventName === 'app:open') {
        desktopEventBus.emit(eventName, payload as { appId: string })
      }

      if (eventName === 'workspace:switch') {
        desktopEventBus.emit(eventName, payload as { workspaceId: string })
      }
    },
  }
}
