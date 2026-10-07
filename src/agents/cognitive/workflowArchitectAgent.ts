export function runWorkflowArchitectAgent(workflow: string) {
  return {
    workflow,
    stages: ['context intake', 'dependency alignment', 'execution burst', 'review checkpoint'],
    suggestedWindowSet: ['monitor', 'ai', 'notes'],
  }
}
