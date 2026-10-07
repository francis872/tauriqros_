/**
 * TAURIQ System Intelligence LLM — Phase 10
 * The internal cognitive language model of the TAURIQ OS.
 * Routes system-aware queries through local inference with a live system context.
 * Falls back to built-in pattern matching when no model is available.
 */

import { runChatInference } from '../../intelligence/runtime/localInferenceRuntime'
import { buildTauriqSystemPrompt } from './systemPromptBuilder'
import type { CoreRuntimeSnapshot } from '../../core/coreRuntimeOrchestrator'
import type { AppWindow } from '../../store/desktopStore'
import type { SnapLayoutId } from '../../windows/layoutTemplates'

// Lazy store reads — avoids circular imports
function getMyLynkUser(): string {
  try {
    const raw = localStorage.getItem('mylynk-auth.v2')
    if (!raw) return 'No identificado'
    const account = JSON.parse(raw)?.state?.currentAccount
    if (!account) return 'No identificado'
    return `${account.displayName} (${account.email})`
  } catch {
    return 'No identificado'
  }
}

function getDexSummary(): string {
  try {
    const raw = localStorage.getItem('balance-dex.v1')
    if (!raw) return ''
    const state = JSON.parse(raw)?.state
    if (!state) return ''
    const contacts: Array<{ name: string; email?: string; status: string }> = state.contacts ?? []
    const messages: Array<{ read: boolean; fromMe: boolean; type: string; subject?: string }> = state.messages ?? []
    const unread = messages.filter((m) => !m.read && !m.fromMe).length
    const unreadEmails = messages.filter((m) => !m.read && !m.fromMe && m.type === 'email').length
    if (!contacts.length) return ''
    return `Dex Mensajería: ${contacts.length} contactos. ${unread} mensajes sin leer${unreadEmails ? ` (${unreadEmails} correos)` : ''}.`
  } catch {
    return ''
  }
}

function getBalanceSummary(): string {
  try {
    const raw = localStorage.getItem('balance.v1')
    if (!raw) return 'Balance app: no data'
    const state = JSON.parse(raw)?.state
    if (!state) return 'Balance app: no data'
    const tasks: Array<{ status: string; priority: string; title: string; column?: string }> = state.tasks ?? []
    const done = tasks.filter((t) => t.status === 'done').length
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length
    const high = tasks.filter((t) => t.priority === 'high' && t.status !== 'done')
    const okrs: Array<{ objective: string }> = state.okrs ?? []
    const lines = [
      `Balance — Tareas: ${tasks.length} total, ${done} completadas, ${inProgress} en progreso.`,
    ]
    if (high.length) lines.push(`Alta prioridad pendiente: ${high.slice(0, 3).map((t) => `"${t.title}"`).join(', ')}${high.length > 3 ? ` y ${high.length - 3} más` : ''}.`)
    if (okrs.length) lines.push(`OKRs activos: ${okrs.map((o) => `"${o.objective}"`).join(', ')}.`)
    return lines.join(' ')
  } catch {
    return 'Balance app: unavailable'
  }
}

function getRelaySummary(): string {
  try {
    const raw = localStorage.getItem('relay.v1')
    if (!raw) return 'RELAY: no data'
    const state = JSON.parse(raw)?.state
    if (!state) return 'RELAY: no data'
    const agents: Array<{ name: string; type: string; status: string }> = state.agents ?? []
    const workflows: Array<{ name: string; status: string }> = state.workflows ?? []
    const active = agents.filter((a) => a.status === 'active').length
    const activeWf = workflows.filter((w) => w.status === 'active').length
    return `RELAY AI Workforce — ${agents.length} agents (${active} active: ${agents.filter((a) => a.status === 'active').map((a) => a.name).join(', ')}). ${workflows.length} workflows, ${activeWf} running. Org: ${state.orgName ?? 'unknown'}.`
  } catch {
    return 'RELAY: unavailable'
  }
}

export interface SystemQueryOptions {
  model?: string
  maxTokens?: number
  openWindows?: AppWindow[]
  activeWorkspace?: string
  activeLayoutId?: SnapLayoutId | null
  userGoals?: string[]
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface SystemQueryResult {
  answer: string
  modelId: string
  latencyMs: number
  fromFallback: boolean
}

// ─── Spanish fallback patterns ────────────────────────────────────────────────

const SPANISH_PATTERNS: Array<{
  test: RegExp
  reply: (match: RegExpMatchArray, opts: SystemQueryOptions) => string
}> = [
  {
    test: /\b(hola|buenos días|buenas tardes|buenas noches|hey|saludos)\b/i,
    reply: (_, opts) => {
      const user = getMyLynkUser()
      const appCount = opts.openWindows?.length ?? 0
      const balance = getBalanceSummary()
      const dex = getDexSummary()
      const name = user.split(' ')[0] !== 'No' ? `, ${user.split(' ')[0]}` : ''
      return `Hola${name}. Soy ROSS, el AI de Tauriq OS. ${appCount > 0 ? `Tienes ${appCount} app${appCount > 1 ? 's' : ''} abiertas. ` : ''}${balance ? balance + ' ' : ''}${dex || '¿En qué puedo ayudarte?'}`
    },
  },
  {
    test: /\b(quién eres|qué eres|preséntate|quién soy|tu nombre|cómo te llamas)\b/i,
    reply: () =>
      'Soy ROSS — el asistente inteligente integrado en Tauriq OS. Tengo acceso en tiempo real al estado del sistema: apps abiertas, tareas de Balance, agentes de RELAY, GPU, workflows y memoria cognitiva. Puedo responder preguntas, analizar el estado del OS y guiarte en su uso.',
  },
  {
    test: /\b(qué puedes|qué haces|ayuda|tus capacidades|para qué sirves)\b/i,
    reply: () =>
      'Puedo: describir el estado del sistema (apps, GPU, agentes, layouts), resumir tus tareas de Balance y OKRs, informarte sobre los agentes activos de RELAY, explicar la arquitectura de Tauriq, y guiarte para usar snapshots de layout, workspaces y el sistema cognitivo. Pregúntame lo que necesites.',
  },
  {
    test: /\b(qué apps|qué aplicaciones|qué tengo abierto|apps abiertas|ventanas abiertas)\b/i,
    reply: (_, opts) => {
      if (!opts.openWindows?.length) return 'No tienes ninguna aplicación abierta en este workspace.'
      const list = opts.openWindows.map((w) => `• ${w.title}`).join('\n')
      return `Tienes ${opts.openWindows.length} app${opts.openWindows.length > 1 ? 's' : ''} abiertas en el workspace "${opts.activeWorkspace}":\n${list}`
    },
  },
  {
    test: /\b(mis tareas|tareas pendientes|balance|kanban|okr|qué tengo que hacer|trabajo pendiente)\b/i,
    reply: () => {
      const summary = getBalanceSummary()
      return summary || 'Balance no tiene datos disponibles. Abre la app Balance para gestionar tus tareas y OKRs.'
    },
  },
  {
    test: /\b(relay|agentes|agents|workflows|automatización|workforce)\b/i,
    reply: () => {
      const summary = getRelaySummary()
      return summary || 'RELAY no tiene datos disponibles. Abre la app Relay para gestionar tus agentes de IA y workflows.'
    },
  },
  {
    test: /\b(correos|mensajes|dex|emails|bandeja|contactos)\b/i,
    reply: () => {
      const summary = getDexSummary()
      return summary || 'No hay datos de Dex disponibles. Abre Balance → pestaña Dex para gestionar mensajes y correos @MY-LYNK.RB.'
    },
  },
  {
    test: /\b(mi cuenta|my.?lynk|sesión|usuario|quién soy|perfil)\b/i,
    reply: () => {
      const user = getMyLynkUser()
      if (user === 'No identificado') return 'No hay ninguna cuenta MY-LYNK activa. Abre la app MY-LYNK para crear o iniciar sesión con tu cuenta @MY-LYNK.RB.'
      return `Estás conectado como ${user} en MY-LYNK. Tu dirección de correo es una dirección @MY-LYNK.RB que funciona en todas las apps de Tauriq.`
    },
  },
  {
    test: /\b(estado|salud|sistema|runtime|cómo está|cómo va)\b/i,
    reply: (_, opts) => {
      const appCount = opts.openWindows?.length ?? 0
      const workspace = opts.activeWorkspace ?? 'default'
      const balance = getBalanceSummary()
      const relay = getRelaySummary()
      return `Sistema Tauriq: activo. Workspace: "${workspace}" — ${appCount} app${appCount !== 1 ? 's' : ''} abiertas. ${balance} ${relay}`
    },
  },
  {
    test: /\b(layout|snap|ventanas|organizar|disposición|tile|dividir)\b/i,
    reply: (_, opts) => {
      const current = opts.activeLayoutId ? `Layout actual: ${opts.activeLayoutId}.` : 'Sin layout snap activo.'
      return `${current} Para activar un layout, pasa el cursor sobre el botón maximizar de cualquier ventana. Tauriq tiene 9 layouts organizados en tres niveles: Base (2 ventanas), Extendido (3-4 ventanas) y Cognitivo (flujos específicos de trabajo profundo, investigación y código).`
    },
  },
  {
    test: /\b(workspace|espacio de trabajo|cambiar workspace|ir a)\b/i,
    reply: () =>
      'Tauriq organiza el trabajo en workspaces nombrados (focus, development, research, ai, creative). Cada uno mantiene sus propias ventanas, layout snap y contexto semántico. Usa la barra lateral para cambiar de workspace; el contexto se restaura automáticamente.',
  },
  {
    test: /\b(gpu|vram|memoria|rendimiento|temperatura|térmica|performance)\b/i,
    reply: () =>
      'La telemetría de GPU se monitorea en tiempo real. Puedes ver el uso, VRAM y temperatura en la barra de telemetría del AI. Tauriq ajusta automáticamente el batch de inferencia bajo presión de memoria.',
  },
  {
    test: /\b(modelo|ollama|inferencia|llama|qwen|phi|ia local)\b/i,
    reply: () =>
      'ROSS usa Ollama para inferencia local. Inicia Ollama (`ollama serve`) y carga un modelo (`ollama run llama3`) para activar respuestas cognitivas completas. Sin Ollama activo, respondo con mi base de conocimiento integrada sobre el sistema.',
  },
  {
    test: /\b(gracias|de nada|ok|listo|perfecto|genial|excelente)\b/i,
    reply: () => 'Con gusto. ¿Hay algo más en lo que pueda ayudarte?',
  },
]

// ─── Built-in fallback patterns ───────────────────────────────────────────────

const BUILT_IN_PATTERNS: Array<{
  test: RegExp
  reply: (match: RegExpMatchArray, opts: SystemQueryOptions) => string
}> = [
  {
    test: /what (is|are) you|who are you|introduce yourself/i,
    reply: () =>
      'I am TAURIQ — a Cognitive Operating Platform. I run on Tauri + Rust with a React UI layer. My cognitive runtime orchestrates local LLMs, autonomous agents, semantic memory, workspace orchestration, and real-time system intelligence.',
  },
  {
    test: /what.*(apps?|windows?) (are )?open/i,
    reply: (_, opts) => {
      if (!opts.openWindows?.length) return 'No applications are currently open on this workspace.'
      const list = opts.openWindows.map((w) => `• ${w.title} (${w.appId})`).join('\n')
      return `${opts.openWindows.length} app(s) open on workspace "${opts.activeWorkspace}":\n${list}`
    },
  },
  {
    test: /snap|layout|tile|arrange|split|window.*layout/i,
    reply: (_, opts) => {
      const current = opts.activeLayoutId
        ? `Current layout: ${opts.activeLayoutId}.`
        : 'No snap layout is active.'
      return `${current} Hover the green maximize button on any window to open the Snap Layout Picker. TAURIQ supports 9 layouts across three tiers: Base (2-equal, main-left, main-right), Extended (3-equal, main+2, 2×2 grid), and Cognitive (AI-focus, Research, Coding). Each layout arranges windows by cognitive priority — the focused window always takes the primary slot.`
    },
  },
  {
    test: /status|health|runtime|system state/i,
    reply: (_, opts) => {
      const workspace = opts.activeWorkspace ?? 'default'
      const appCount = opts.openWindows?.length ?? 0
      return `TAURIQ runtime: active. Workspace: "${workspace}" — ${appCount} app(s) open. Cognitive kernel: running. Agent mesh: online. Inference queue: ready. Use the AI panel telemetry bar for live GPU and throughput data.`
    },
  },
  {
    test: /workspace/i,
    reply: () =>
      'TAURIQ organises work into named workspaces — each has its own set of windows, snap layout, and semantic context. Use the sidebar to switch workspaces. Layouts are persisted per-workspace so context resumes automatically.',
  },
  {
    test: /gpu|vram|memory|performance|temperature|thermal/i,
    reply: () =>
      'GPU telemetry is tracked in real time via the cognitive performance runtime. You can see utilisation, VRAM usage, and thermal state in the AI app header telemetry bar. TAURIQ automatically adjusts inference batch size under memory pressure.',
  },
  {
    test: /agent|supervisor|mesh/i,
    reply: () =>
      'TAURIQ runs a multi-agent cognitive mesh. The Agent Supervisor coordinates task execution, recovery, and continuity. Persistent agents maintain context across sessions. The cognitive agent mesh handles parallel reasoning, tool use, and goal tracking.',
  },
  {
    test: /model|ollama|llm|llama|qwen|phi/i,
    reply: () =>
      'TAURIQ routes inference through the local model runtime → Tauri native bridge → Ollama. Select your model in the AI app header dropdown. Supported: qwen, llama3, phi3, and any model installed in your Ollama instance. Start Ollama to activate full cognitive responses.',
  },
  {
    test: /phase|architecture|how.*work|built|tech/i,
    reply: () =>
      'TAURIQ is built across multiple cognitive layers: React + TypeScript (UI shell), Zustand (state), Tauri/Rust (native bridge), Ollama (inference), and a custom cognitive runtime with semantic memory, autonomous agents, and workspace orchestration. Phase 10 introduces snap layout intelligence and the System LLM layer.',
  },
  {
    test: /recover|heal|error|crash|fix/i,
    reply: () =>
      'The TAURIQ Recovery Supervisor monitors all runtime services and executes healing procedures automatically. If a service fails, it is queued for recovery with exponential backoff. You can monitor recovery state via the observability layer in the cognitive runtime.',
  },
  {
    test: /plan|goal|workflow|automat/i,
    reply: () =>
      'The Autonomous Planner tracks active goals and predicts next workflow steps based on semantic memory and workspace context. Workflows are defined in the automation system and can be triggered manually or autonomously when conditions are met.',
  },
  // --- Phase 11 patterns ---
  {
    test: /intent|habit|pattern|behavior|predict.*next|what.*next/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const ie = snap?.intentEngine
      if (ie?.dominantPattern) {
        return `TAURIQ Intent Engine has mapped your dominant workflow pattern: "${ie.dominantPattern}" (${(ie.confidenceScore * 100).toFixed(0)}% confidence). ${ie.prediction ? `Predicted next action: ${ie.prediction.nextAppId}. ${ie.prediction.reasoning}` : `Building behavioral model from ${ie.sessionSignalCount} session signals.`}`
      }
      return 'The TAURIQ Intent Engine learns your workflow habits by observing app transitions, layout changes, and context switches. It uses this to predict your next action and autonomously prepare workspaces before you need them.'
    },
  },
  {
    test: /self.?heal|heal|repair|stabilit|pressure|mitigat/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const ph = snap?.processHealing
      if (ph) {
        return `Self-Healing Supervisor: ${ph.supervisorStatus}. Stability: ${(ph.stability.overallScore * 100).toFixed(0)}%, resource pressure: ${(ph.pressure.pressureScore * 100).toFixed(0)}%. Repairs completed this session: ${ph.repairs.completedCount}. ${ph.pressure.mitigations.length ? `Active mitigations: ${ph.pressure.mitigations.slice(0, 2).join(', ')}.` : 'No active mitigations needed.'}`
      }
      return 'TAURIQ Phase 11 adds an autonomous self-healing runtime that continuously monitors GPU pressure, inference queue saturation, agent mesh health, and crash continuity. It automatically runs repair procedures when degradation is detected.'
    },
  },
  {
    test: /model.*mesh|mesh|distributed.*model|route.*inference|inference.*route/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const mm = snap?.modelMesh
      if (mm) {
        return `Model Mesh: active model is ${mm.activeModelId}, routing strategy: ${mm.routingStrategy}. Distributed mesh: ${mm.meshEnabled ? 'enabled across peers' : 'local only'}. Selection reason: ${mm.selection.selectionReason}.`
      }
      return 'The TAURIQ Distributed Model Mesh routes inference queries to the optimal model based on task type, GPU utilisation, VRAM availability, and queue depth. It supports local models (phi3, qwen, llama3) and cloud overflow fallback.'
    },
  },
  {
    test: /autonomous.*workspace|compose.*workspace|workspace.*composer|predict.*workspace/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const aw = snap?.autonomousWorkspace
      if (aw?.spec) {
        return `Autonomous Workspace Composer: active spec "${aw.spec.label}" for workspace "${aw.spec.workspaceId}". Productivity estimate: ${(aw.spec.estimatedProductivityScore * 100).toFixed(0)}%. Session type: ${aw.sessionFlow?.sessionType ?? 'unknown'}. ${aw.savedWorkspaceCount} saved configurations.`
      }
      return 'The Autonomous Workspace Composer builds and restores workspace configurations based on your behavioral intent. It predicts session flow, suggests layouts, and can restore full workspace state after a crash via continuity checkpoints.'
    },
  },
  {
    test: /neural.*command|command.*neural|voice.*command|natural.*language.*command/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const nc = snap?.neuralCommands
      if (nc) {
        return `Neural Command Runtime: ${nc.availableCommands} commands available. Session: ${nc.sessionCommandCount} commands processed, ${(nc.recognitionRate * 100).toFixed(0)}% recognition rate. Type natural language commands like "restore workspace", "optimize runtime", or "focus mode".`
      }
      return 'The TAURIQ Neural Command Layer lets you control the OS with natural language. Commands like "restore workspace", "research mode", "optimize runtime", and "open AI stack" are parsed by the context action engine and executed by the system action runtime.'
    },
  },
  {
    test: /cognitive.*window|window.*manager|focus.*layout|snap.*adapt/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const cw = snap?.cognitiveWindows
      if (cw) {
        return `Cognitive Window Manager: ${cw.managedWindowCount} windows, mode: ${cw.cognitiveMode}. Layout adaptation: ${cw.snapAdaptation.layoutStability}. ${cw.snapAdaptation.adaptationReason}`
      }
      return 'The TAURIQ AI Window Manager automatically optimises snap layouts based on your cognitive mode (deep-work, research, development, review). It detects focus app type and recommends layouts with confidence scoring.'
    },
  },
  {
    test: /overlay|hud|panel|monitoring.*overlay/i,
    reply: () =>
      'The TAURIQ Cognitive Overlay (Phase 11) provides a live HUD accessible via the ⚙ button in the bottom-right. It shows: Agent Activity Radar, Self-Healing State, Inference Timeline, and Intent Graph — all updating from the live CoreRuntimeSnapshot.',
  },
  // --- Phase 12 patterns ---
  {
    test: /autonomous.*kernel|kernel.*cogni|autonomy.*level|cognition.*score/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const ak = snap?.autonomousKernel
      if (ak) return `Autonomous Kernel: state=${ak.adaptiveState}, autonomy=${ak.autonomyLevel}, cognition=${(ak.cognitionScore * 100).toFixed(0)}%, pressure=${(ak.executionPressure * 100).toFixed(0)}%. Next: ${ak.nextScheduledAction}.`
      return 'The TAURIQ Autonomous Kernel continuously measures cognitive pressure and adapts the system autonomy level from assisted through fully-autonomous, dispatching proactive execution cycles.'
    },
  },
  {
    test: /agent.*societ|society.*agent|cooperat.*agent|agent.*hierarch/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const as_ = snap?.agentSociety
      if (as_) return `Agent Society: ${as_.agentCount} agents, depth=${as_.hierarchyDepth}, personality=${as_.dominantPersonality}, cooperation=${(as_.cooperationEfficiency * 100).toFixed(0)}%, consensus=${as_.consensusReached ? 'reached' : 'pending'}.`
      return 'The TAURIQ Agent Society organises agents into hierarchies with consensus voting, delegation, and cooperative planning. Dominant personality shapes how the collective behaves.'
    },
  },
  {
    test: /predictive.*ui|ui.*generat|adaptive.*interface|ui.*predict/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const pu = snap?.predictiveUi
      if (pu) return `Predictive UI: layout=${pu.layout.hint}, pressure=${pu.uiPressure}, density=${(pu.semanticDensity * 100).toFixed(0)}%, ${pu.suggestions.length} active suggestions.`
      return 'The TAURIQ Predictive UI Runtime generates adaptive interface layouts and proactive component suggestions based on intent confidence and workflow context.'
    },
  },
  {
    test: /workspace.*evolv|evolv.*workspace|zone.*adapt|workspace.*phase/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const we = snap?.workspaceEvolution
      if (we) return `Workspace Evolution: phase=${we.evolutionPhase}, mutations=${we.mutationCount}, continuity=${(we.continuityScore * 100).toFixed(0)}%, next transition: ${we.predictedNextTransition}.`
      return 'The TAURIQ Workspace Evolution Engine continuously mutates workspace zones based on usage patterns, predicts workspace transitions, and maintains semantic continuity across sessions.'
    },
  },
  {
    test: /memory.*fabric|fabric.*memory|distributed.*memory|memory.*shard/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const mf = snap?.memoryFabric
      if (mf) return `Memory Fabric: ${mf.nodeCount} nodes, ${mf.activeShards} shards, integrity=${(mf.memoryIntegrityScore * 100).toFixed(0)}%, sync=${(mf.syncConfidence * 100).toFixed(0)}%, conflicts resolved: ${mf.conflictsResolved}.`
      return 'The TAURIQ Distributed Memory Fabric replicates and shards cognitive knowledge across logical nodes with semantic conflict resolution and vector routing.'
    },
  },
  {
    test: /runtime.*optim|optim.*runtime|energy.*mode|thread.*balance/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const ro = snap?.runtimeOptimization
      if (ro) return `Runtime Optimization: energy=${ro.energyMode}, gain=${(ro.optimizationGain * 100).toFixed(0)}%, render pressure=${(ro.renderPressure * 100).toFixed(0)}%, latency comp: ${ro.latencyCompensationMs}ms.`
      return 'The TAURIQ Adaptive Runtime Optimization layer balances CPU/GPU allocation, thread distribution, and render load based on real-time thermal and workload signals.'
    },
  },
  {
    test: /autonomous.*workflow|workflow.*autonom|self.*execut|workflow.*chain/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const aw = snap?.autonomousWorkflows
      if (aw) return `Autonomous Workflows: ${aw.activeChains} active chains, health=${aw.workflowHealth}, efficiency=${(aw.executionEfficiency * 100).toFixed(0)}%, recovered=${aw.recoveredChains}. Goal: ${aw.currentGoal}.`
      return 'The TAURIQ Autonomous Workflow Runtime self-executes task chains, mutates plans in response to changing conditions, and recovers failed workflows automatically.'
    },
  },
  {
    test: /render.*cogni|cogni.*render|visual.*complex|frame.*schedule/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const cr = snap?.cognitiveRendering
      if (cr) return `Cognitive Rendering: complexity=${cr.visualComplexity}, mode=${cr.frameScheduleMode}, quality=${(cr.adaptiveQuality * 100).toFixed(0)}%, ${cr.predictedFrameMs}ms/frame, compressed: ${cr.compressedElements} elements.`
      return 'The TAURIQ Cognitive Rendering Engine adaptively compresses visual elements, schedules frames based on GPU pressure, and adjusts visual complexity to maintain smooth performance.'
    },
  },
  {
    test: /neural.*interact|interact.*neural|cursor.*predict|gesture.*runtime/i,
    reply: (_, opts) => {
      const snap = (opts as any)._snapshot
      const ni = snap?.neuralInteraction
      if (ni) return `Neural Interaction: mode=${ni.contextualInputMode}, score=${(ni.neuralOptimizationScore * 100).toFixed(0)}%, ${ni.adaptiveShortcutsLearned} shortcuts, accuracy=${(ni.patternAccuracy * 100).toFixed(0)}%. Next input: ${ni.predictedNextInput}.`
      return 'The TAURIQ Neural Interaction Layer predicts user inputs, learns interaction patterns, generates cognitive shortcuts, and enables semantic cursor prediction based on intent context.'
    },
  },
]

function tryBuiltInFallback(
  query: string,
  opts: SystemQueryOptions,
): string | null {
  // Spanish patterns first (user is more likely to write in Spanish)
  for (const pattern of SPANISH_PATTERNS) {
    const match = query.match(pattern.test)
    if (match) return pattern.reply(match, opts)
  }
  // English patterns
  for (const pattern of BUILT_IN_PATTERNS) {
    const match = query.match(pattern.test)
    if (match) return pattern.reply(match, opts)
  }
  return null
}

// ─── Main query function ──────────────────────────────────────────────────────

export async function querySystemIntelligence(
  userQuery: string,
  snapshot: CoreRuntimeSnapshot | null,
  options: SystemQueryOptions = {},
): Promise<SystemQueryResult> {
  const {
    model = snapshot?.aiRuntime.selectedModel ?? 'qwen',
    maxTokens = 512,
    openWindows = [],
    activeWorkspace = 'default',
    activeLayoutId = null,
    userGoals = [],
    conversationHistory = [],
  } = options

  const systemPrompt = buildTauriqSystemPrompt(snapshot, {
    openWindows,
    activeWorkspace,
    activeLayoutId,
    userGoals,
  })

  // Enrich with live app state
  const appContext = [
    getBalanceSummary(),
    getRelaySummary(),
    getDexSummary(),
    `Usuario MY-LYNK: ${getMyLynkUser()}`,
  ].filter(Boolean).join('\n')

  const t0 = performance.now()

  try {
    // Build chat messages array with conversation history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: `${systemPrompt}\n\n[ESTADO EN VIVO]\n${appContext}` },
      // Include last 8 turns for context without overloading the model
      ...conversationHistory.slice(-8),
      { role: 'user', content: userQuery },
    ]

    const result = await runChatInference(messages, maxTokens)

    const trimmed = result.output.trim()
    if (!trimmed) throw new Error('empty')

    return {
      answer: trimmed,
      modelId: result.modelId,
      latencyMs: result.latencyMs,
      fromFallback: false,
    }
  } catch {
    const builtIn = tryBuiltInFallback(userQuery, { ...options, _snapshot: snapshot } as SystemQueryOptions & { _snapshot: unknown })

    // Smart live-data fallback when no pattern matches
    const smartFallback = (() => {
      const appCount = openWindows.length
      const balance = getBalanceSummary()
      const dex = getDexSummary()
      const user = getMyLynkUser()
      const parts: string[] = []
      if (user !== 'No identificado') parts.push(`Conectado como ${user}.`)
      if (appCount > 0) parts.push(`${appCount} app${appCount > 1 ? 's' : ''} abiertas en workspace "${activeWorkspace}".`)
      if (balance) parts.push(balance)
      if (dex) parts.push(dex)
      parts.push('Inicia Ollama para respuestas cognitivas completas.')
      return parts.join(' ')
    })()

    return {
      answer: builtIn ?? smartFallback,
      modelId: model,
      latencyMs: Number((performance.now() - t0).toFixed(1)),
      fromFallback: true,
    }
  }
}
