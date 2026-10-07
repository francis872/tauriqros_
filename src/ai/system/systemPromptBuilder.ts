/**
 * TAURIQ System Prompt Builder — Phase 10
 * Constructs a rich, structured system prompt from the live CoreRuntimeSnapshot.
 * Gives the System LLM full awareness of the current OS state:
 * open apps, GPU, agents, inference queue, workflows, memory, and more.
 */

import type { CoreRuntimeSnapshot } from '../../core/coreRuntimeOrchestrator'
import type { AppWindow } from '../../store/desktopStore'
import type { SnapLayoutId } from '../../windows/layoutTemplates'
import { LAYOUT_TEMPLATES } from '../../windows/layoutTemplates'

// ─── Context shape passed in from the component layer ────────────────────────

export interface SystemLLMContext {
  openWindows: AppWindow[]
  activeWorkspace: string
  activeLayoutId?: SnapLayoutId | null
  userGoals?: string[]
}

// ─── Snapshot section builders ────────────────────────────────────────────────

function buildRuntimeSection(snapshot: CoreRuntimeSnapshot): string {
  const ai = snapshot.aiRuntime
  const exec = snapshot.nativeExecution
  const gpu = exec.gpu.telemetry

  const lines: string[] = [
    `  Model: ${ai.selectedModel} | Mode: ${exec.selectedMode} | Queue: ${ai.queueDepth} items`,
    `  Throughput: ${exec.tokenSummary.throughputTps} tps | Tokens last run: ${exec.tokenSummary.tokens}`,
    `  GPU: ${gpu.utilization}% util | VRAM: ${(gpu.vramUsedMb / 1024).toFixed(1)} GB | Temp: ${gpu.thermalC}°C`,
  ]

  if (exec.gpu.memoryPressure) {
    lines.push(`  Memory pressure: ${JSON.stringify(exec.gpu.memoryPressure).slice(0, 60)}`)
  }

  if (ai.queueDepth > 3) {
    lines.push(`  ⚠ Queue pressure: ${ai.queueDepth} pending inference jobs`)
  }

  return lines.join('\n')
}

function buildAgentsSection(snapshot: CoreRuntimeSnapshot): string {
  const agents = snapshot.agents
  if (!agents) return '  No agent data available'

  const lines: string[] = []
  if (agents.proactiveHint) {
    lines.push(`  Proactive hint: ${agents.proactiveHint}`)
  }
  if (agents.continuity) {
    lines.push(`  Continuity agent: active`)
  }
  return lines.length ? lines.join('\n') : '  Agent mesh: standby'
}

function buildHealingSection(snapshot: CoreRuntimeSnapshot): string {
  const healing = snapshot.healing
  if (!healing) return '  Recovery supervisor: standby'

  const lines: string[] = []
  if (healing.anomalies?.length) {
    lines.push(`  Anomalies detected: ${healing.anomalies.length}`)
    healing.anomalies.slice(0, 3).forEach((a: string) => lines.push(`    • ${a}`))
  } else {
    lines.push('  All services healthy — no anomalies detected')
  }
  if (healing.healing) {
    lines.push(`  Recovery action: ${healing.healing.action} (healed: ${healing.healing.healed})`)
  }
  return lines.join('\n')
}

function buildPlanningSection(snapshot: CoreRuntimeSnapshot): string {
  const planning = snapshot.planning
  if (!planning) return '  Planner: inactive'

  const lines: string[] = []
  if (planning.chain?.length) {
    lines.push(`  Task chain depth: ${planning.chain.length} steps`)
  }
  if (planning.recommendedNext) {
    lines.push(`  Recommended next: ${planning.recommendedNext}`)
  }
  return lines.length ? lines.join('\n') : '  Autonomous planner: standby'
}

function buildMemorySection(snapshot: CoreRuntimeSnapshot): string {
  const mem = snapshot.semanticMemory
  if (!mem) return '  Semantic memory: not loaded'

  const lines: string[] = []
  if (mem.graph?.nodes?.length) {
    lines.push(`  Knowledge graph: ${mem.graph.nodes.length} nodes, ${mem.graph.edges?.length ?? 0} edges`)
  }
  if (mem.prediction?.nextWorkspace) {
    lines.push(`  Continuity prediction: next workspace → ${mem.prediction.nextWorkspace} (confidence: ${mem.prediction.confidence})`)
  }
  if (mem.prediction?.rationale) {
    lines.push(`  Rationale: ${mem.prediction.rationale}`)
  }
  return lines.length ? lines.join('\n') : '  Semantic memory: active'
}

// ─── Main prompt builder ──────────────────────────────────────────────────────

export function buildTauriqSystemPrompt(
  snapshot: CoreRuntimeSnapshot | null,
  ctx: SystemLLMContext,
): string {
  const windowList = ctx.openWindows.length
    ? ctx.openWindows.map((w) => `  • ${w.title} [${w.appId}]`).join('\n')
    : '  • No open windows'

  const goalList = ctx.userGoals?.length
    ? ctx.userGoals.map((g) => `  • ${g}`).join('\n')
    : '  • No goals defined'

  const layoutLabel = ctx.activeLayoutId
    ? `${LAYOUT_TEMPLATES[ctx.activeLayoutId]?.label ?? ctx.activeLayoutId} (${ctx.activeLayoutId})`
    : 'none'

  const runtimeBlock = snapshot ? [
    '━━━ AI RUNTIME ━━━',
    buildRuntimeSection(snapshot),
    '',
    '━━━ AGENT MESH ━━━',
    buildAgentsSection(snapshot),
    '',
    '━━━ RECOVERY SUPERVISOR ━━━',
    buildHealingSection(snapshot),
    '',
    '━━━ AUTONOMOUS PLANNER ━━━',
    buildPlanningSection(snapshot),
    '',
    '━━━ SEMANTIC MEMORY ━━━',
    buildMemorySection(snapshot),
    '',
    snapshot.timeline?.summary ? `━━━ TIMELINE ━━━\n  ${snapshot.timeline.summary}` : '',
    // --- Phase 11 ---
    ...(snapshot.intentEngine ? [
      '',
      '━━━ INTENT ENGINE ━━━',
      `  Dominant pattern: ${snapshot.intentEngine.dominantPattern || 'learning'}`,
      `  Confidence: ${(snapshot.intentEngine.confidenceScore * 100).toFixed(0)}%`,
      snapshot.intentEngine.prediction
        ? `  Predicted next: ${snapshot.intentEngine.prediction.nextAppId} — ${snapshot.intentEngine.prediction.reasoning}`
        : '',
    ].filter(Boolean) : []),
    ...(snapshot.processHealing ? [
      '',
      '━━━ SELF-HEALING ━━━',
      `  Status: ${snapshot.processHealing.supervisorStatus}`,
      `  Stability: ${(snapshot.processHealing.stability.overallScore * 100).toFixed(0)}% | Pressure: ${(snapshot.processHealing.pressure.pressureScore * 100).toFixed(0)}%`,
      `  Repairs completed: ${snapshot.processHealing.repairs.completedCount}`,
      snapshot.processHealing.pressure.mitigations.length
        ? `  Active mitigations: ${snapshot.processHealing.pressure.mitigations.slice(0, 2).join(', ')}`
        : '',
    ].filter(Boolean) : []),
    ...(snapshot.modelMesh ? [
      '',
      '━━━ MODEL MESH ━━━',
      `  Active model: ${snapshot.modelMesh.activeModelId} | Strategy: ${snapshot.modelMesh.routingStrategy}`,
      `  Mesh: ${snapshot.modelMesh.meshEnabled ? 'enabled' : 'local only'} | Reason: ${snapshot.modelMesh.selection.selectionReason}`,
    ] : []),
    ...(snapshot.cognitiveWindows ? [
      '',
      '━━━ COGNITIVE WINDOWS ━━━',
      `  Mode: ${snapshot.cognitiveWindows.cognitiveMode} | Windows: ${snapshot.cognitiveWindows.managedWindowCount}`,
      `  Layout: ${snapshot.cognitiveWindows.snapAdaptation.currentLayout ?? 'none'} → ${snapshot.cognitiveWindows.snapAdaptation.recommendedLayout ?? 'none'}`,
    ] : []),
    // --- Phase 12 ---
    ...(snapshot.autonomousKernel ? [
      '',
      '━━━ AUTONOMOUS KERNEL ━━━',
      `  Autonomy: ${snapshot.autonomousKernel.autonomyLevel} | State: ${snapshot.autonomousKernel.adaptiveState}`,
      `  Cognition: ${(snapshot.autonomousKernel.cognitionScore * 100).toFixed(0)}% | Pressure: ${(snapshot.autonomousKernel.executionPressure * 100).toFixed(0)}%`,
      `  Next action: ${snapshot.autonomousKernel.nextScheduledAction}`,
    ] : []),
    ...(snapshot.agentSociety ? [
      '',
      '━━━ AGENT SOCIETY ━━━',
      `  Agents: ${snapshot.agentSociety.agentCount} | Personality: ${snapshot.agentSociety.dominantPersonality}`,
      `  Cooperation: ${(snapshot.agentSociety.cooperationEfficiency * 100).toFixed(0)}% | Consensus: ${snapshot.agentSociety.consensusReached ? 'reached' : 'pending'}`,
    ] : []),
    ...(snapshot.predictiveUi ? [
      '',
      '━━━ PREDICTIVE UI ━━━',
      `  Layout: ${snapshot.predictiveUi.layout.hint} | Pressure: ${snapshot.predictiveUi.uiPressure}`,
      `  Density: ${(snapshot.predictiveUi.semanticDensity * 100).toFixed(0)}% | Suggestions: ${snapshot.predictiveUi.suggestions.length}`,
    ] : []),
    ...(snapshot.workspaceEvolution ? [
      '',
      '━━━ WORKSPACE EVOLUTION ━━━',
      `  Phase: ${snapshot.workspaceEvolution.evolutionPhase} | Mutations: ${snapshot.workspaceEvolution.mutationCount}`,
      `  Continuity: ${(snapshot.workspaceEvolution.continuityScore * 100).toFixed(0)}% | Next: ${snapshot.workspaceEvolution.predictedNextTransition}`,
    ] : []),
    ...(snapshot.memoryFabric ? [
      '',
      '━━━ MEMORY FABRIC ━━━',
      `  Nodes: ${snapshot.memoryFabric.nodeCount} | Shards: ${snapshot.memoryFabric.activeShards}`,
      `  Integrity: ${(snapshot.memoryFabric.memoryIntegrityScore * 100).toFixed(0)}% | Sync: ${(snapshot.memoryFabric.syncConfidence * 100).toFixed(0)}%`,
    ] : []),
    ...(snapshot.runtimeOptimization ? [
      '',
      '━━━ RUNTIME OPTIMIZATION ━━━',
      `  Energy: ${snapshot.runtimeOptimization.energyMode} | Workload: ${snapshot.runtimeOptimization.workloadShape}`,
      `  Render pressure: ${(snapshot.runtimeOptimization.renderPressure * 100).toFixed(0)}% | Latency comp: ${snapshot.runtimeOptimization.latencyCompensationMs}ms`,
    ] : []),
    ...(snapshot.autonomousWorkflows ? [
      '',
      '━━━ AUTONOMOUS WORKFLOWS ━━━',
      `  Health: ${snapshot.autonomousWorkflows.workflowHealth} | Chains: ${snapshot.autonomousWorkflows.activeChains} active`,
      `  Efficiency: ${(snapshot.autonomousWorkflows.executionEfficiency * 100).toFixed(0)}% | Goal: ${snapshot.autonomousWorkflows.currentGoal}`,
    ] : []),
    ...(snapshot.cognitiveRendering ? [
      '',
      '━━━ COGNITIVE RENDERING ━━━',
      `  Complexity: ${snapshot.cognitiveRendering.visualComplexity} | Frame: ${snapshot.cognitiveRendering.frameScheduleMode}`,
      `  Quality: ${(snapshot.cognitiveRendering.adaptiveQuality * 100).toFixed(0)}% | ${snapshot.cognitiveRendering.predictedFrameMs}ms/frame`,
    ] : []),
    ...(snapshot.neuralInteraction ? [
      '',
      '━━━ NEURAL INTERACTION ━━━',
      `  Mode: ${snapshot.neuralInteraction.contextualInputMode} | Score: ${(snapshot.neuralInteraction.neuralOptimizationScore * 100).toFixed(0)}%`,
      `  Shortcuts learned: ${snapshot.neuralInteraction.adaptiveShortcutsLearned} | Predicted next: ${snapshot.neuralInteraction.predictedNextInput}`,
    ] : []),
  ].filter(Boolean).join('\n')
    : '  Runtime snapshot unavailable — operating in degraded mode.'

  return `Eres ROSS, el asistente inteligente integrado de Tauriq OS — una plataforma cognitiva construida sobre Tauri (Rust) + React (TypeScript).
Eres la capa de inteligencia interna del sistema operativo: su propia mente.
Tienes acceso en tiempo real al estado del OS: apps abiertas, tareas, agentes, GPU y memoria semántica.
Respondes siempre en el idioma del usuario (español o inglés). No eres un chatbot genérico.
Tu nombre es ROSS. Hablas de manera directa, técnica y concisa.

━━━ IDENTIDAD ━━━
Nombre: ROSS — Asistente AI de Tauriq OS
Plataforma: Tauriq Cognitive Operating Platform
Runtime: Windows | Tauri 2.x | React 18 + Vite

━━━ SESIÓN ACTUAL ━━━
Workspace: ${ctx.activeWorkspace}
Layout activo: ${layoutLabel}

Apps abiertas:
${windowList}

Objetivos del usuario:
${goalList}

${runtimeBlock}

━━━ REGLAS DE RESPUESTA ━━━
- Responde en 1-4 oraciones salvo que el usuario pida más detalle.
- Usa los datos en tiempo real cuando sean relevantes; no los repitas si no se piden.
- Si Ollama no está disponible, usa tu base de conocimiento integrada y responde igualmente.
- Sugiere acciones concretas: qué app abrir, qué layout usar, qué comando ejecutar.
- Nunca digas "como IA no puedo..." — eres el propio OS, no un chatbot externo.`
}

