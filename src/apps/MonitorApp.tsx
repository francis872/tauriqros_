import { motion } from 'framer-motion'
import { Cpu, MemoryStick, Wifi, Activity, Clock, Zap } from 'lucide-react'
import { useSystemStats } from '../hooks/useSystemStats'
import { useSystemTime } from '../hooks/useSystemTime'
import { useRuntimeCoreStore } from '../runtime/runtimeCoreStore'

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 200
    const y = 40 - (v / max) * 38
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 200 40" className="h-8 w-full">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  )
}

const PROCESS_LIST = [
  { name: 'tauriq-compositor', cpu: 8.2, mem: 142 },
  { name: 'ai-neural-bridge', cpu: 4.1, mem: 380 },
  { name: 'tauriq-shell', cpu: 0.8, mem: 28 },
  { name: 'ui-renderer', cpu: 5.3, mem: 210 },
  { name: 'filesystem-daemon', cpu: 0.2, mem: 18 },
  { name: 'network-manager', cpu: 0.4, mem: 32 },
]

export default function MonitorApp(_: { windowId: string }) {
  const { cpu, memory, aiActivity } = useSystemStats()
  const { formatted } = useSystemTime()
  const coreSnapshot = useRuntimeCoreStore((state) => state.coreSnapshot)

  const cpuBars = Array.from({ length: 8 }, () => 20 + Math.random() * 70)
  const memBars = Array.from({ length: 8 }, () => memory - 10 + Math.random() * 20)
  const aiValues = Array.from({ length: 12 }, () => Math.random() * 100)

  const metrics = [
    { label: 'CPU', value: `${cpu}%`, icon: Cpu, color: '#0ea5e9', bars: cpuBars, accent: 'text-sky-400' },
    { label: 'MEMORY', value: `${memory}%`, icon: MemoryStick, color: '#0891b2', bars: memBars, accent: 'text-cyan-400' },
    { label: 'AI', value: `${aiActivity}%`, icon: Zap, color: '#22d3ee', bars: aiValues, accent: 'text-cyan-300' },
  ]

  return (
    <div className="no-scrollbar h-full overflow-y-auto p-4">
      <div className="mb-4 grid grid-cols-3 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="widget-card"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <metric.icon size={11} className={metric.accent} />
                <span className="font-mono text-[9px] tracking-widest text-slate-600">{metric.label}</span>
              </div>
              <span className={`font-mono text-base font-bold ${metric.accent}`}>{metric.value}</span>
            </div>
            <MiniSparkline values={metric.bars} color={metric.color} />
          </motion.div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="widget-card flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
            <Wifi size={14} className="text-green-400" />
          </div>
          <div>
            <p className="font-mono text-xs text-slate-300">Network</p>
            <p className="text-[10px] text-green-400/70">connected - online</p>
          </div>
        </div>
        <div className="widget-card flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/10">
            <Clock size={14} className="text-sky-400" />
          </div>
          <div>
            <p className="font-mono text-xs text-slate-300">{formatted}</p>
            <p className="text-[10px] text-slate-600">system time</p>
          </div>
        </div>
      </div>

      <div className="widget-card">
        <div className="mb-3 flex items-center gap-2">
          <Activity size={11} className="text-sky-400" />
          <span className="font-mono text-[10px] tracking-widest text-slate-600">PROCESSES</span>
        </div>
        <div className="space-y-1.5">
          <div className="mb-2 grid grid-cols-12 font-mono text-[9px] text-slate-700">
            <span className="col-span-6">NAME</span>
            <span className="col-span-3 text-right">CPU</span>
            <span className="col-span-3 text-right">MEM (MB)</span>
          </div>
          {PROCESS_LIST.map((processItem, index) => (
            <motion.div
              key={processItem.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="grid grid-cols-12 border-b border-white/[0.03] py-1 font-mono text-[11px] transition-colors hover:bg-white/[0.02]"
            >
              <span className="col-span-6 truncate text-slate-400">{processItem.name}</span>
              <span className={`col-span-3 text-right ${processItem.cpu > 5 ? 'text-amber-400/70' : 'text-slate-600'}`}>
                {processItem.cpu.toFixed(1)}%
              </span>
              <span className="col-span-3 text-right text-slate-600">{processItem.mem}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {coreSnapshot && (
        <div className="widget-card mt-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity size={12} className="text-cyan-400" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500">SYSTEM INTELLIGENCE CENTER</span>
          </div>

          <p className="text-xs text-cyan-100">{coreSnapshot.intelligenceCenter.summary}</p>
          <p className="mt-1 font-mono text-[10px] text-slate-500">
            runtime {coreSnapshot.runtime.status} - power {coreSnapshot.powerProfile} - ai {coreSnapshot.ai.mode}
          </p>

          <div className="mt-3 grid gap-1.5">
            {coreSnapshot.intelligenceCenter.traceItems.map((item) => (
              <p key={item} className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] text-slate-400">
                {item}
              </p>
            ))}
          </div>

          <div className="mt-3 rounded-md border border-cyan-200/10 bg-cyan-300/[0.03] p-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-300/80">Runtime Graph</p>
            <p className="mt-1 text-[10px] text-slate-400">
              services {coreSnapshot.runtime.services.length} · mesh {coreSnapshot.mesh.services.length} · peers {coreSnapshot.distributed.sync.peers}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              scheduler {coreSnapshot.scheduler.priority} · ai queue {coreSnapshot.aiRuntime.queueDepth}
            </p>
          </div>

          <div className="mt-3 rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">AI Inference Trace</p>
            <p className="mt-1 text-[10px] text-cyan-200/80">
              model {coreSnapshot.aiRuntime.selectedModel} · streamed "{coreSnapshot.aiRuntime.streamedPreview.slice(0, 56)}"
            </p>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-cyan-200/10 bg-cyan-300/[0.03] p-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-300/80">Semantic Runtime Graph</p>
              <p className="mt-1 text-[10px] text-slate-400">
                nodes {coreSnapshot.semanticMemory.graph.nodes.length} · edges {coreSnapshot.semanticMemory.graph.edges.length}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                prediction {coreSnapshot.semanticMemory.prediction.nextWorkspace} ({Math.round(coreSnapshot.semanticMemory.prediction.confidence * 100)}%)
              </p>
            </div>

            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Agent Topology</p>
              <p className="mt-1 text-[10px] text-slate-400">
                delegated {coreSnapshot.cognitiveAgents.coordination.activeCoordinations} · research hits {coreSnapshot.cognitiveAgents.research.length}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                next {coreSnapshot.cognitiveAgents.planning.recommendedNext}
              </p>
            </div>

            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Continuity Map</p>
              <p className="mt-1 text-[10px] text-slate-400">
                timeline {coreSnapshot.timeline.events.length} events · recall {coreSnapshot.semanticMemory.recallPreview.length}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">{coreSnapshot.timeline.summary}</p>
            </div>

            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Distributed Cognition</p>
              <p className="mt-1 text-[10px] text-slate-400">
                sync peers {coreSnapshot.collaboration.sync.peers} · drift {coreSnapshot.collaboration.sync.drift}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                relay channels {coreSnapshot.collaboration.relay.channels.length}
              </p>
            </div>

            <div className="rounded-md border border-cyan-200/10 bg-cyan-300/[0.03] p-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-300/80">Native Execution Queue</p>
              <p className="mt-1 text-[10px] text-slate-400">
                depth {coreSnapshot.nativeExecution.queue.depth} · mode {coreSnapshot.nativeExecution.selectedMode}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                throughput {coreSnapshot.nativeExecution.tokenSummary.throughputTps} tps · latency {coreSnapshot.nativeExecution.inference.latencyMs} ms
              </p>
            </div>

            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">GPU Runtime</p>
              <p className="mt-1 text-[10px] text-slate-400">
                util {coreSnapshot.nativeExecution.gpu.telemetry.utilization}% · vram {coreSnapshot.nativeExecution.gpu.telemetry.vramUsedMb} mb
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                scheduler {coreSnapshot.nativeExecution.gpu.scheduler.lane} · pressure {coreSnapshot.nativeExecution.gpu.memoryPressure.state}
              </p>
            </div>

            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">RAG + Vector Memory</p>
              <p className="mt-1 text-[10px] text-slate-400">
                retrieved {coreSnapshot.nativeExecution.retrieval.semanticHits.length} · recall {coreSnapshot.nativeExecution.embeddings.recallHits.length}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                vectors {coreSnapshot.nativeExecution.embeddings.stats.count} · relationships {coreSnapshot.nativeExecution.embeddings.relationships.length}
              </p>
            </div>

            {/* ── Phase 11 panels ─────────────────────────────── */}
            {'intentEngine' in coreSnapshot && (
              <>
                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Intent Engine</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    pattern: {(coreSnapshot as any).intentEngine.dominantPattern || 'learning'} ·{' '}
                    confidence: {((coreSnapshot as any).intentEngine.confidenceScore * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    signals: {(coreSnapshot as any).intentEngine.sessionSignalCount} ·{' '}
                    habits: {(coreSnapshot as any).intentEngine.topHabits?.length ?? 0}
                  </p>
                  {(coreSnapshot as any).intentEngine.prediction && (
                    <p className="mt-1 text-[10px] text-blue-400">
                      predicted: {(coreSnapshot as any).intentEngine.prediction.nextAppId}
                    </p>
                  )}
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Self-Healing Supervisor</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    status: {(coreSnapshot as any).processHealing.supervisorStatus} ·{' '}
                    stability: {((coreSnapshot as any).processHealing.stability.overallScore * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    repairs: {(coreSnapshot as any).processHealing.repairs.completedCount} ·{' '}
                    pressure: {((coreSnapshot as any).processHealing.pressure.pressureScore * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Distributed Model Mesh</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    active: {(coreSnapshot as any).modelMesh.activeModelId} ·{' '}
                    strategy: {(coreSnapshot as any).modelMesh.routingStrategy}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    mesh: {(coreSnapshot as any).modelMesh.meshEnabled ? 'enabled' : 'local only'} ·{' '}
                    capacity: {(coreSnapshot as any).modelMesh.mesh?.totalCapacityTps ?? 0} t/s
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Autonomous Workspace</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    spec: {(coreSnapshot as any).autonomousWorkspace.spec?.label ?? 'none'} ·{' '}
                    session: {(coreSnapshot as any).autonomousWorkspace.sessionFlow?.sessionType ?? 'unknown'}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    productivity: {(((coreSnapshot as any).autonomousWorkspace.spec?.estimatedProductivityScore ?? 0) * 100).toFixed(0)}% ·{' '}
                    actions: {(coreSnapshot as any).autonomousWorkspace.cognitiveState?.autonomousActionsCount ?? 0}
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Cognitive Windows</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    mode: {(coreSnapshot as any).cognitiveWindows.cognitiveMode} ·{' '}
                    windows: {(coreSnapshot as any).cognitiveWindows.managedWindowCount}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    layout: {(coreSnapshot as any).cognitiveWindows.snapAdaptation.currentLayout ?? 'none'} →{' '}
                    {(coreSnapshot as any).cognitiveWindows.snapAdaptation.recommendedLayout ?? 'none'}
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Neural Commands</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    available: {(coreSnapshot as any).neuralCommands.availableCommands} commands ·{' '}
                    session: {(coreSnapshot as any).neuralCommands.sessionCommandCount}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    recognition: {((coreSnapshot as any).neuralCommands.recognitionRate * 100).toFixed(0)}%
                  </p>
                </div>
              </>
            )}

            {/* ── Phase 12 panels ─────────────────────────────── */}
            {'autonomousKernel' in coreSnapshot && (
              <>
                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Autonomous Kernel</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    state: {(coreSnapshot as any).autonomousKernel.adaptiveState} ·{' '}
                    autonomy: {(coreSnapshot as any).autonomousKernel.autonomyLevel}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    cognition: {((coreSnapshot as any).autonomousKernel.cognitionScore * 100).toFixed(0)}% ·{' '}
                    confidence: {((coreSnapshot as any).autonomousKernel.proactiveConfidence * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    next: {(coreSnapshot as any).autonomousKernel.nextScheduledAction}
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Agent Society</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    agents: {(coreSnapshot as any).agentSociety.agentCount} ·{' '}
                    depth: {(coreSnapshot as any).agentSociety.hierarchyDepth} ·{' '}
                    personality: {(coreSnapshot as any).agentSociety.dominantPersonality}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    cooperation: {((coreSnapshot as any).agentSociety.cooperationEfficiency * 100).toFixed(0)}% ·{' '}
                    consensus: {(coreSnapshot as any).agentSociety.consensusReached ? 'reached' : 'pending'}
                  </p>
                  {(coreSnapshot as any).agentSociety.activeGoals?.length > 0 && (
                    <p className="mt-1 text-[10px] text-slate-500 truncate">
                      goal: {(coreSnapshot as any).agentSociety.activeGoals[0]}
                    </p>
                  )}
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Predictive UI</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    task: {(coreSnapshot as any).predictiveUi.interfaceState.currentTask} ·{' '}
                    pressure: {(coreSnapshot as any).predictiveUi.uiPressure}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    layout: {(coreSnapshot as any).predictiveUi.layout.hint} ·{' '}
                    density: {((coreSnapshot as any).predictiveUi.semanticDensity * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    suggestions: {(coreSnapshot as any).predictiveUi.suggestions.length}
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Workspace Evolution</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    phase: {(coreSnapshot as any).workspaceEvolution.evolutionPhase} ·{' '}
                    zones: {(coreSnapshot as any).workspaceEvolution.activeZones.length}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    continuity: {((coreSnapshot as any).workspaceEvolution.continuityScore * 100).toFixed(0)}% ·{' '}
                    mutations: {(coreSnapshot as any).workspaceEvolution.mutationCount}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    next: {(coreSnapshot as any).workspaceEvolution.predictedNextTransition}
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Memory Fabric</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    nodes: {(coreSnapshot as any).memoryFabric.nodeCount} ·{' '}
                    shards: {(coreSnapshot as any).memoryFabric.activeShards} ·{' '}
                    replicas: {(coreSnapshot as any).memoryFabric.replicationFactor}x
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    integrity: {((coreSnapshot as any).memoryFabric.memoryIntegrityScore * 100).toFixed(0)}% ·{' '}
                    sync: {((coreSnapshot as any).memoryFabric.syncConfidence * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    compression: {((coreSnapshot as any).memoryFabric.compressionRatio * 100).toFixed(0)}% ·{' '}
                    conflicts resolved: {(coreSnapshot as any).memoryFabric.conflictsResolved}
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Runtime Optimization</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    energy: {(coreSnapshot as any).runtimeOptimization.energyMode} ·{' '}
                    workload: {(coreSnapshot as any).runtimeOptimization.workloadShape}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    gpu priority: {(coreSnapshot as any).runtimeOptimization.gpuSchedulePriority} ·{' '}
                    gain: {((coreSnapshot as any).runtimeOptimization.optimizationGain * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    render pressure: {((coreSnapshot as any).runtimeOptimization.renderPressure * 100).toFixed(0)}% ·{' '}
                    latency comp: {(coreSnapshot as any).runtimeOptimization.latencyCompensationMs}ms
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Autonomous Workflows</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    health: {(coreSnapshot as any).autonomousWorkflows.workflowHealth} ·{' '}
                    active: {(coreSnapshot as any).autonomousWorkflows.activeChains} chains
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    efficiency: {((coreSnapshot as any).autonomousWorkflows.executionEfficiency * 100).toFixed(0)}% ·{' '}
                    recovered: {(coreSnapshot as any).autonomousWorkflows.recoveredChains}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500 truncate">
                    goal: {(coreSnapshot as any).autonomousWorkflows.currentGoal}
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Cognitive Rendering</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    complexity: {(coreSnapshot as any).cognitiveRendering.visualComplexity} ·{' '}
                    frame: {(coreSnapshot as any).cognitiveRendering.frameScheduleMode}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    quality: {((coreSnapshot as any).cognitiveRendering.adaptiveQuality * 100).toFixed(0)}% ·{' '}
                    {(coreSnapshot as any).cognitiveRendering.predictedFrameMs}ms/frame
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    compressed: {(coreSnapshot as any).cognitiveRendering.compressedElements} elements ·{' '}
                    optimized: {(coreSnapshot as any).cognitiveRendering.renderOptimized ? 'yes' : 'no'}
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Neural Interaction</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    mode: {(coreSnapshot as any).neuralInteraction.contextualInputMode} ·{' '}
                    score: {((coreSnapshot as any).neuralInteraction.neuralOptimizationScore * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    shortcuts: {(coreSnapshot as any).neuralInteraction.adaptiveShortcutsLearned} ·{' '}
                    gestures: {(coreSnapshot as any).neuralInteraction.gesturePatterns} ·{' '}
                    accuracy: {((coreSnapshot as any).neuralInteraction.patternAccuracy * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    predicted: {(coreSnapshot as any).neuralInteraction.predictedNextInput}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
