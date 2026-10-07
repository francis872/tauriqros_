import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Bot, FolderOpen, Layers, Search, Settings, Sparkles, Terminal, Workflow, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import RelayIcon from '../apps/relay/RelayIcon'
import { resolveLauncherIntents } from '../launcher/commandRouter'
import type { WorkspaceId } from '../workspace/workspaceModels'
import type { TauriqSessionRuntimeSnapshot } from '../session/tauriqSessionManager'

interface NaturalLanguageLauncherProps {
  open: boolean
  onClose: () => void
  onRunAction: (actionId: string) => void
  onSwitchWorkspace: (workspaceId: WorkspaceId) => void
  onTriggerWorkflow: (workflowId: string) => void
  runtimeSnapshot: TauriqSessionRuntimeSnapshot | null
  unreadCount: number
}

const ICONS = {
  relay: RelayIcon,
  bot: Bot,
  folder: FolderOpen,
  settings: Settings,
  terminal: Terminal,
  workflow: Workflow,
  activity: Activity,
  layers: Layers,
  zap: Zap,
  search: Search,
  sparkles: Sparkles,
} as const

const CONTEXT_HINTS = [
  'open files and terminal in development workspace',
  'switch to ai workspace',
  'resume interrupted workflows with agent supervisor',
  'run local ai inference with streaming',
  'synchronize distributed runtime state',
  'open system monitor',
]

export default function NaturalLanguageLauncher({
  open,
  onClose,
  onRunAction,
  onSwitchWorkspace,
  onTriggerWorkflow,
  runtimeSnapshot,
  unreadCount,
}: NaturalLanguageLauncherProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const cognitiveHints = useMemo(() => {
    if (!runtimeSnapshot) {
      return []
    }

    const hints: string[] = []
    const anomalies = runtimeSnapshot.core.healing.anomalies.length
    const queueDepth = runtimeSnapshot.core.aiRuntime.queueDepth
    const peers = runtimeSnapshot.core.distributed.peers.length

    if (anomalies > 0) {
      hints.push('open monitor and inspect runtime anomalies')
    }

    if (queueDepth > 0) {
      hints.push('prioritize ai inference queue and continue streaming')
    }

    if (peers > 1) {
      hints.push('review distributed mesh peer health and replication')
    }

    if (runtimeSnapshot.core.agents.health.activeAgents > 0) {
      hints.push('resume interrupted workflows with agent supervisor')
    }

    return hints
  }, [runtimeSnapshot])

  const hints = useMemo(() => {
    const combined = [...cognitiveHints, ...CONTEXT_HINTS]
    return Array.from(new Set(combined)).slice(0, 6)
  }, [cognitiveHints])

  const intents = useMemo(() => {
    const results = resolveLauncherIntents(query)
    return results
  }, [query])

  const executeIntent = (index: number) => {
    const intent = intents[index]
    if (!intent) {
      return
    }

    if (intent.type === 'open-app' && intent.appId) {
      onRunAction(intent.appId)
      onClose()
      return
    }

    if (intent.type === 'switch-workspace' && intent.workspaceId) {
      onSwitchWorkspace(intent.workspaceId)
      onClose()
      return
    }

    if (intent.type === 'workflow' && intent.workflowId) {
      onTriggerWorkflow(intent.workflowId)
      onClose()
      return
    }

    onRunAction('ai')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-40 flex items-start justify-center bg-black/55 px-4 pt-24 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-cyan-200/15 bg-[#070c14]/90 shadow-[0_20px_70px_rgba(0,0,0,0.7)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/10 px-5 py-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/75">TAURIQ Command Surface</p>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setSelectedIndex((previous) => Math.min(previous + 1, Math.max(intents.length - 1, 0)))
                  }

                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    setSelectedIndex((previous) => Math.max(previous - 1, 0))
                  }

                  if (event.key === 'Enter') {
                    event.preventDefault()
                    executeIntent(selectedIndex)
                  }
                }}
                autoFocus
                placeholder="Route apps, workflows, and context-aware commands..."
                className="w-full bg-transparent font-mono text-sm text-cyan-50 outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="border-b border-white/10 px-5 py-2">
              <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                <span>AI {runtimeSnapshot?.core.aiRuntime.selectedModel ?? 'warming'}</span>
                <span>Queue {runtimeSnapshot?.core.aiRuntime.queueDepth ?? 0}</span>
                <span>Peers {runtimeSnapshot?.core.distributed.peers.length ?? 0}</span>
                <span>Alerts {unreadCount}</span>
                <span>Memory {runtimeSnapshot?.core.semanticMemory.graph.nodes.length ?? 0}</span>
                <span>GPU {runtimeSnapshot?.core.nativeExecution.gpu.telemetry.utilization ?? 0}%</span>
                <span>TPS {runtimeSnapshot?.core.nativeExecution.tokenSummary.throughputTps ?? 0}</span>
              </div>

              {runtimeSnapshot && (
                <div className="mb-2 rounded-lg border border-cyan-200/15 bg-cyan-300/[0.04] px-2.5 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-300/80">Predictive Workflow</p>
                  <p className="mt-1 text-xs text-cyan-100">{runtimeSnapshot.core.predictiveWorkspace.prompt}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {hints.map((hint) => (
                  <button
                    key={hint}
                    onClick={() => {
                      setQuery(hint)
                      setSelectedIndex(0)
                    }}
                    className="rounded-md border border-cyan-200/15 bg-cyan-200/5 px-2 py-1 font-mono text-[10px] text-cyan-200/80 transition-colors hover:border-cyan-200/30"
                  >
                    {hint}
                  </button>
                ))}
              </div>

              {runtimeSnapshot && runtimeSnapshot.core.semanticMemory.recallPreview.length > 0 && (
                <div className="mt-2 grid gap-1">
                  {runtimeSnapshot.core.semanticMemory.recallPreview.slice(0, 2).map((entry) => (
                    <div key={entry.node.id} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1">
                      <p className="text-xs text-slate-200">{entry.node.label}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                        recall rank {entry.rank} · {entry.node.workspaceId}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {runtimeSnapshot && (
                <div className="mt-2 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1">
                  <p className="text-xs text-slate-200">RAG preview: {runtimeSnapshot.core.nativeExecution.rag.retrievedContext.slice(0, 92)}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    mode {runtimeSnapshot.core.nativeExecution.selectedMode} · vectors {runtimeSnapshot.core.nativeExecution.embeddings.stats.count}
                  </p>
                </div>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2 no-scrollbar">
              {intents.map((intent, index) => {
                const Icon = ICONS[intent.icon as keyof typeof ICONS] ?? Sparkles
                const active = index === selectedIndex

                return (
                  <button
                    key={intent.id}
                    onMouseMove={() => setSelectedIndex(index)}
                    onClick={() => executeIntent(index)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                      active
                        ? 'bg-cyan-300/10 ring-1 ring-cyan-300/30'
                        : 'hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-400/10 text-cyan-200">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-100">{intent.label}</p>
                      <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                        {intent.subtitle}
                      </p>
                    </div>
                  </button>
                )
              })}

              {intents.length === 0 && (
                <p className="px-3 py-6 text-center font-mono text-xs text-slate-500">
                  No intent matched. Try "switch to ai workspace".
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
