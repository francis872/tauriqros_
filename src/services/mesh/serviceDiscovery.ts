export interface MeshService {
  id: string
  domain: 'runtime' | 'ai' | 'filesystem' | 'telemetry' | 'orchestration'
  endpoint: string
}

export function discoverMeshServices(): MeshService[] {
  return [
    { id: 'runtime.health', domain: 'runtime', endpoint: 'runtime_supervisor_state' },
    { id: 'ai.infer', domain: 'ai', endpoint: 'ai_runtime_infer' },
    { id: 'filesystem.semantic', domain: 'filesystem', endpoint: 'filesystem_semantic_summary' },
    { id: 'telemetry.trace', domain: 'telemetry', endpoint: 'telemetry_trace_summary' },
    { id: 'orchestration.graph', domain: 'orchestration', endpoint: 'orchestration_dependency_graph' },
  ]
}
