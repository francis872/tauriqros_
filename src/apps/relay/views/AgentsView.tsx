import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRelayStore, type AgentType, type AgentStatus, type RelayAgent } from '../relayStore'
import { Plus, Trash2, X, ChevronRight, Send, Eraser, WifiOff, MessageSquare, Info } from 'lucide-react'
import { streamChat, buildSystemPrompt, pingOllama, RELAY_MODEL, type OllamaMessage } from '../lib/ollama'

const STATUS_CONFIG: Record<AgentStatus, { dot: string; text: string; label: string }> = {
  active:   { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Active' },
  idle:     { dot: 'bg-amber-400',   text: 'text-amber-400',   label: 'Idle' },
  training: { dot: 'bg-violet-400',  text: 'text-violet-400',  label: 'Training' },
  offline:  { dot: 'bg-zinc-600',    text: 'text-zinc-500',    label: 'Offline' },
}

const TYPE_EMOJI: Record<AgentType, string> = {
  sales: '💼', support: '🎧', analyst: '📊', voice: '🎤', vision: '👁️', orchestrator: '🔮',
}

const TYPE_COLOR: Record<AgentType, string> = {
  sales: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  support: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  analyst: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  voice: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  vision: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  orchestrator: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

const MODELS = ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro', 'o3-mini', 'Whisper + TTS-HD', 'GPT-4o Vision']
const AGENT_TYPES: AgentType[] = ['sales', 'support', 'analyst', 'voice', 'vision', 'orchestrator']

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

// ─── Info Panel ───────────────────────────────────────────────────────────────
function InfoPanel({ selected, updateAgentStatus, deleteAgent, setSelectedId }: {
  selected: RelayAgent
  updateAgentStatus: (id: string, status: AgentStatus) => void
  deleteAgent: (id: string) => void
  setSelectedId: (id: string | null) => void
}) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      {/* Agent header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] text-3xl">
            {TYPE_EMOJI[selected.type]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{selected.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TYPE_COLOR[selected.type]}`}>
                {selected.type}
              </span>
              <span className="text-[10px] text-slate-600">{selected.model}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {(['active', 'idle', 'offline'] as AgentStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updateAgentStatus(selected.id, s)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold capitalize transition ${selected.status === s ? 'bg-violet-600 text-white' : 'border border-white/[0.08] text-slate-500 hover:text-slate-300'}`}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            title="Eliminar agente"
            aria-label="Eliminar agente"
            onClick={() => { deleteAgent(selected.id); setSelectedId(null) }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-5">{selected.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Messages', value: selected.messagesHandled.toLocaleString() },
          { label: 'Uptime', value: `${selected.uptime}%` },
          { label: 'Last Active', value: timeAgo(selected.lastActive) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-center">
            <p className="text-lg font-bold text-violet-300">{value}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Capabilities</p>
        <div className="flex flex-wrap gap-2">
          {selected.skills.map((skill) => (
            <span key={skill} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] text-slate-400">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel({ agent, messages, addChatMessage, clearConversation }: {
  agent: RelayAgent
  messages: ReturnType<typeof useRelayStore.getState>['conversations'][string]
  addChatMessage: ReturnType<typeof useRelayStore.getState>['addChatMessage']
  clearConversation: ReturnType<typeof useRelayStore.getState>['clearConversation']
}) {
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamBuffer, setStreamBuffer] = useState('')
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Check Ollama on mount and when agent changes
  useEffect(() => {
    let cancelled = false
    pingOllama().then((ok) => { if (!cancelled) setOllamaOnline(ok) })
    return () => { cancelled = true }
  }, [agent.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamBuffer])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    // Add user message
    addChatMessage(agent.id, { role: 'user', content: text, agentId: agent.id })

    // Build Ollama messages history
    const history: OllamaMessage[] = [
      { role: 'system', content: buildSystemPrompt(agent) },
      ...(messages ?? []).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: text },
    ]

    setStreaming(true)
    setStreamBuffer('')
    setOllamaOnline(true)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const full = await streamChat(history, (token) => {
        setStreamBuffer((prev) => prev + token)
      }, ctrl.signal)

      addChatMessage(agent.id, { role: 'assistant', content: full, agentId: agent.id })
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const isNetErr = err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('network'))
      if (isNetErr) {
        setOllamaOnline(false)
      } else {
        addChatMessage(agent.id, { role: 'assistant', content: `⚠️ Error: ${err instanceof Error ? err.message : String(err)}`, agentId: agent.id })
      }
    } finally {
      setStreaming(false)
      setStreamBuffer('')
      abortRef.current = null
    }
  }, [input, streaming, agent, messages, addChatMessage])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-h-0">
      {/* Offline banner */}
      {ollamaOnline === false && (
        <div className="flex items-center gap-2 border-b border-red-500/20 bg-red-500/10 px-4 py-2">
          <WifiOff size={13} className="text-red-400 flex-shrink-0" />
          <p className="text-[11px] text-red-400">
            Ollama no está corriendo. Ejecuta <code className="text-red-300 bg-red-500/20 rounded px-1">ollama serve</code> y luego <code className="text-red-300 bg-red-500/20 rounded px-1">ollama run llama3</code>
          </p>
        </div>
      )}

      {/* Agent header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-lg">
          {TYPE_EMOJI[agent.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200">{agent.name}</p>
          <p className="text-[10px] text-slate-600">{RELAY_MODEL} · Ollama local</p>
        </div>
        <button
          type="button"
          title="Limpiar conversación"
          aria-label="Limpiar conversación"
          onClick={() => clearConversation(agent.id)}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition"
        >
          <Eraser size={12} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {(!messages || messages.length === 0) && !streaming && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="text-3xl">{TYPE_EMOJI[agent.type]}</div>
            <p className="text-sm font-semibold text-slate-300">{agent.name} listo</p>
            <p className="text-[11px] text-slate-600 max-w-xs">{agent.description}</p>
            <p className="text-[10px] text-slate-700 mt-2">Requiere Ollama corriendo con <span className="text-violet-400">llama3</span></p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {(messages ?? []).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-zinc-800 text-slate-200 border border-white/[0.06] rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming bubble */}
        {streaming && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-zinc-800 border border-white/[0.06] px-3 py-2 text-[12px] leading-relaxed text-slate-200 whitespace-pre-wrap">
              {streamBuffer || <span className="inline-flex gap-1 items-center text-slate-600"><span className="animate-pulse">●</span><span className="animate-pulse delay-75">●</span><span className="animate-pulse delay-150">●</span></span>}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 border-t border-white/[0.06] px-3 py-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Habla con ${agent.name}…`}
          rows={1}
          disabled={streaming}
          className="flex-1 resize-none rounded-xl border border-white/[0.08] bg-zinc-800/80 px-3 py-2 text-[12px] text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none disabled:opacity-50 max-h-24 overflow-y-auto"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        <button
          type="button"
          title="Enviar"
          aria-label="Enviar mensaje"
          onClick={send}
          disabled={!input.trim() || streaming}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:opacity-40"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Main View ─────────────────────────────────────────────────────────────────
export default function AgentsView() {
  const { agents, conversations, addAgent, updateAgentStatus, deleteAgent, addChatMessage, clearConversation } = useRelayStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<AgentStatus | 'all'>('all')
  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info')

  // Create form state
  const [form, setForm] = useState({ name: '', type: 'sales' as AgentType, model: 'GPT-4o', description: '', skills: '' })

  const filtered = filter === 'all' ? agents : agents.filter((a) => a.status === filter)
  const selected = agents.find((a) => a.id === selectedId) ?? null

  function handleCreate() {
    if (!form.name.trim()) return
    addAgent({
      name: form.name.trim(),
      type: form.type,
      model: form.model,
      status: 'idle',
      description: form.description,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    })
    setForm({ name: '', type: 'sales', model: 'GPT-4o', description: '', skills: '' })
    setShowCreate(false)
  }

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Agent list */}
      <div className="flex w-72 flex-col border-r border-white/[0.06] flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <p className="text-xs font-semibold text-slate-400">Agent Fleet ({agents.length})</p>
          <button
            type="button"
            title="Nuevo agente"
            aria-label="Nuevo agente"
            onClick={() => setShowCreate(true)}
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-1 border-b border-white/[0.06] px-3 py-2">
          {(['all', 'active', 'idle', 'offline'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-2 py-1 text-[10px] font-medium capitalize transition ${filter === f ? 'bg-violet-600/20 text-violet-300' : 'text-slate-600 hover:text-slate-400'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {filtered.map((agent) => {
              const sc = STATUS_CONFIG[agent.status]
              return (
                <motion.button
                  key={agent.id}
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedId(agent.id === selectedId ? null : agent.id)}
                  className={`flex w-full items-center gap-3 border-b border-white/[0.04] px-4 py-3 text-left transition hover:bg-white/[0.02] ${selectedId === agent.id ? 'bg-violet-500/10' : ''}`}
                >
                  <span className="text-lg">{TYPE_EMOJI[agent.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-200 truncate">{agent.name}</p>
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5">{agent.model} · {sc.label}</p>
                  </div>
                  <ChevronRight size={10} className="text-slate-700" />
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail pane */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {selected ? (
          <>
            {/* Tab bar */}
            <div className="flex items-center gap-1 border-b border-white/[0.06] px-4 py-2">
              {(['info', 'chat'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold capitalize transition ${activeTab === t ? 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  {t === 'info' ? <Info size={11} /> : <MessageSquare size={11} />}
                  {t === 'info' ? 'Info' : 'Chat Real'}
                </button>
              ))}
            </div>
            {activeTab === 'info' ? (
              <InfoPanel selected={selected} updateAgentStatus={updateAgentStatus} deleteAgent={deleteAgent} setSelectedId={setSelectedId} />
            ) : (
              <ChatPanel agent={selected} messages={conversations[selected.id] ?? []} addChatMessage={addChatMessage} clearConversation={clearConversation} />
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] text-2xl">🤖</div>
              <p className="text-sm text-slate-500">Select an agent to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Create agent modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-white">Deploy New Agent</h3>
                <button type="button" title="Cerrar" aria-label="Cerrar" onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-slate-300">
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  placeholder="Agent name (e.g. Atlas, Iris, Nova)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  title="Agent name"
                  aria-label="Agent name"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as AgentType })}
                      title="Agent type"
                      aria-label="Agent type"
                      className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-300 focus:border-violet-500/50 focus:outline-none"
                    >
                      {AGENT_TYPES.map((t) => <option key={t} value={t}>{TYPE_EMOJI[t]} {t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Model</label>
                    <select
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      title="Agent model"
                      aria-label="Agent model"
                      className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-300 focus:border-violet-500/50 focus:outline-none"
                    >
                      {MODELS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <input
                  placeholder="Skills (comma-separated)"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  title="Agent skills"
                  aria-label="Agent skills"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none"
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  title="Agent description"
                  aria-label="Agent description"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:border-violet-500/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!form.name.trim()}
                  className="w-full rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
                >
                  Deploy Agent
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
