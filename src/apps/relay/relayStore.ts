import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AgentStatus = 'active' | 'idle' | 'training' | 'offline'
export type AgentType = 'sales' | 'support' | 'analyst' | 'voice' | 'vision' | 'orchestrator'

export interface RelayAgent {
  id: string
  name: string
  type: AgentType
  status: AgentStatus
  model: string
  skills: string[]
  messagesHandled: number
  uptime: number
  createdAt: number
  lastActive: number
  description: string
}

export type WorkflowStatus = 'active' | 'paused' | 'draft' | 'error'

export interface RelayWorkflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  trigger: string
  steps: number
  runs: number
  lastRun: number | null
  createdAt: number
}

export type ConnectionType = 'crm' | 'erp' | 'database' | 'api' | 'email' | 'docs' | 'slack' | 'sheets'
export type ConnectionStatus = 'connected' | 'pending' | 'error' | 'syncing'

export interface DataConnection {
  id: string
  name: string
  type: ConnectionType
  status: ConnectionStatus
  records: number
  lastSync: number | null
}

export type CallStatus = 'active' | 'completed' | 'failed'

export interface VoiceCall {
  id: string
  contact: string
  duration: number
  status: CallStatus
  transcript: string
  startedAt: number
}

export type NodeType = 'trigger' | 'agent' | 'action' | 'condition' | 'output'

export interface StudioNode {
  id: string
  type: NodeType
  label: string
  x: number
  y: number
  connectedTo: string[]
}

export interface ChatMessage {
  id: string
  agentId: string
  role: 'user' | 'assistant'
  content: string
  ts: number
}

interface RelayState {
  orgName: string
  agents: RelayAgent[]
  workflows: RelayWorkflow[]
  connections: DataConnection[]
  calls: VoiceCall[]
  studioNodes: StudioNode[]
  totalTokensUsed: number
  conversations: Record<string, ChatMessage[]>
  // Agent actions
  addAgent: (agent: Omit<RelayAgent, 'id' | 'createdAt' | 'lastActive' | 'messagesHandled' | 'uptime'>) => void
  updateAgentStatus: (id: string, status: AgentStatus) => void
  deleteAgent: (id: string) => void
  // Workflow actions
  addWorkflow: (wf: Omit<RelayWorkflow, 'id' | 'createdAt' | 'runs' | 'lastRun'>) => void
  toggleWorkflow: (id: string) => void
  runWorkflow: (id: string) => void
  deleteWorkflow: (id: string) => void
  // Connection actions
  addConnection: (conn: Omit<DataConnection, 'id' | 'lastSync'>) => void
  removeConnection: (id: string) => void
  // Studio actions
  addStudioNode: (node: Omit<StudioNode, 'id' | 'connectedTo'>) => void
  connectNodes: (fromId: string, toId: string) => void
  moveNode: (id: string, x: number, y: number) => void
  deleteStudioNode: (id: string) => void
  // Chat actions
  addChatMessage: (agentId: string, msg: Omit<ChatMessage, 'id' | 'ts'>) => void
  clearConversation: (agentId: string) => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

const now = Date.now()
const d = (days: number) => now - 86400000 * days

const INITIAL_AGENTS: RelayAgent[] = [
  { id: uid(), name: 'Atlas', type: 'sales', status: 'active', model: 'GPT-4o', skills: ['lead scoring', 'follow-up', 'email outreach'], messagesHandled: 1847, uptime: 98.2, createdAt: d(7), lastActive: now - 60000, description: 'Agente SDR especializado en calificación de leads y seguimiento automático.' },
  { id: uid(), name: 'Iris', type: 'support', status: 'active', model: 'Claude 3.5 Sonnet', skills: ['tickets', 'resolution', 'escalation'], messagesHandled: 3214, uptime: 99.1, createdAt: d(14), lastActive: now - 30000, description: 'Agente de soporte con resolución autónoma de tickets y escalación inteligente.' },
  { id: uid(), name: 'Nova', type: 'analyst', status: 'idle', model: 'GPT-4o', skills: ['reports', 'data analysis', 'insights', 'forecasting'], messagesHandled: 426, uptime: 94.5, createdAt: d(3), lastActive: now - 300000, description: 'Analista de datos operacional con generación de reportes y detección de patrones.' },
  { id: uid(), name: 'Echo', type: 'voice', status: 'active', model: 'Whisper + TTS-HD', skills: ['inbound calls', 'transcription', 'synthesis', 'scheduling'], messagesHandled: 892, uptime: 97.3, createdAt: d(5), lastActive: now - 10000, description: 'Agente de voz para llamadas salientes, transcripción en tiempo real y síntesis natural.' },
  { id: uid(), name: 'Lens', type: 'vision', status: 'idle', model: 'GPT-4o Vision', skills: ['document OCR', 'image analysis', 'data extraction'], messagesHandled: 318, uptime: 96.0, createdAt: d(2), lastActive: now - 900000, description: 'Agente visual para análisis de documentos, imágenes y extracción de datos no estructurados.' },
  { id: uid(), name: 'Orion', type: 'orchestrator', status: 'active', model: 'o3-mini', skills: ['routing', 'delegation', 'memory', 'coordination'], messagesHandled: 5621, uptime: 99.9, createdAt: d(30), lastActive: now - 5000, description: 'Orquestador central. Coordina y delega tareas entre todos los agentes del ecosistema.' },
]

const INITIAL_WORKFLOWS: RelayWorkflow[] = [
  { id: uid(), name: 'Lead Qualification Pipeline', description: 'Califica leads entrantes y asigna a SDR agent', status: 'active', trigger: 'New CRM Contact', steps: 6, runs: 1243, lastRun: now - 3600000, createdAt: d(10) },
  { id: uid(), name: 'Support Auto-Resolution', description: 'Resuelve tickets de soporte nivel 1 sin intervención humana', status: 'active', trigger: 'New Support Ticket', steps: 4, runs: 3891, lastRun: now - 600000, createdAt: d(20) },
  { id: uid(), name: 'Weekly Analytics Report', description: 'Genera reporte semanal de métricas y lo distribuye', status: 'active', trigger: 'Cron — Mon 9:00 AM', steps: 3, runs: 12, lastRun: d(2), createdAt: d(90) },
  { id: uid(), name: 'Customer Onboarding', description: 'Secuencia de bienvenida y activación para nuevos clientes', status: 'paused', trigger: 'New Customer Event', steps: 8, runs: 87, lastRun: d(5), createdAt: d(60) },
  { id: uid(), name: 'Cart Recovery', description: 'Recupera carritos abandonados con seguimiento inteligente', status: 'draft', trigger: 'Cart Abandoned (24h)', steps: 5, runs: 0, lastRun: null, createdAt: d(1) },
]

const INITIAL_CONNECTIONS: DataConnection[] = [
  { id: uid(), name: 'Salesforce CRM', type: 'crm', status: 'connected', records: 14823, lastSync: now - 3600000 },
  { id: uid(), name: 'PostgreSQL Main DB', type: 'database', status: 'connected', records: 892341, lastSync: now - 1800000 },
  { id: uid(), name: 'Gmail Business', type: 'email', status: 'connected', records: 44210, lastSync: now - 900000 },
  { id: uid(), name: 'Google Drive Docs', type: 'docs', status: 'syncing', records: 1247, lastSync: null },
  { id: uid(), name: 'Slack Workspace', type: 'slack', status: 'connected', records: 89012, lastSync: now - 7200000 },
  { id: uid(), name: 'REST API (Internal)', type: 'api', status: 'connected', records: 0, lastSync: now - 300000 },
]

const INITIAL_CALLS: VoiceCall[] = [
  { id: uid(), contact: 'Carlos Mendez', duration: 243, status: 'completed', transcript: 'Se acordó una demo para el martes. El cliente está interesado en el plan Enterprise. Acción: enviar propuesta antes del viernes.', startedAt: now - 3600000 },
  { id: uid(), contact: 'Laura Pérez', duration: 87, status: 'completed', transcript: 'Consulta sobre precios del plan Starter. Se envió propuesta por email. Cliente evaluando opciones.', startedAt: now - 7200000 },
  { id: uid(), contact: 'Inbound +1 555 0193', duration: 0, status: 'active', transcript: '', startedAt: now - 30000 },
  { id: uid(), contact: 'Mario Soto', duration: 412, status: 'completed', transcript: 'Soporte técnico. Problema resuelto: configuración de webhook. Satisfacción: alta.', startedAt: d(1) },
]

const INITIAL_NODES: StudioNode[] = [
  { id: 'n1', type: 'trigger', label: 'New Lead', x: 50, y: 120, connectedTo: ['n2'] },
  { id: 'n2', type: 'agent', label: 'Atlas — SDR', x: 200, y: 80, connectedTo: ['n3', 'n4'] },
  { id: 'n3', type: 'condition', label: 'Score > 70?', x: 370, y: 40, connectedTo: ['n5'] },
  { id: 'n4', type: 'action', label: 'Send Email', x: 370, y: 160, connectedTo: [] },
  { id: 'n5', type: 'agent', label: 'Orion — Route', x: 540, y: 40, connectedTo: ['n6'] },
  { id: 'n6', type: 'output', label: 'CRM Update', x: 710, y: 40, connectedTo: [] },
]

export const useRelayStore = create<RelayState>()(
  persist(
    (set) => ({
      orgName: 'Acme Corp',
      agents: INITIAL_AGENTS,
      workflows: INITIAL_WORKFLOWS,
      connections: INITIAL_CONNECTIONS,
      calls: INITIAL_CALLS,
      studioNodes: INITIAL_NODES,
      totalTokensUsed: 2_847_391,
      conversations: {},

      addAgent: (agent) => set((s) => ({
        agents: [...s.agents, {
          ...agent,
          id: uid(),
          messagesHandled: 0,
          uptime: 100,
          createdAt: Date.now(),
          lastActive: Date.now(),
        }],
      })),

      updateAgentStatus: (id, status) => set((s) => ({
        agents: s.agents.map((a) => a.id === id ? { ...a, status, lastActive: Date.now() } : a),
      })),

      deleteAgent: (id) => set((s) => ({ agents: s.agents.filter((a) => a.id !== id) })),

      addWorkflow: (wf) => set((s) => ({
        workflows: [...s.workflows, { ...wf, id: uid(), runs: 0, lastRun: null, createdAt: Date.now() }],
      })),

      toggleWorkflow: (id) => set((s) => ({
        workflows: s.workflows.map((w) =>
          w.id === id ? { ...w, status: w.status === 'active' ? 'paused' : 'active' } : w
        ),
      })),

      runWorkflow: (id) => set((s) => ({
        workflows: s.workflows.map((w) =>
          w.id === id ? { ...w, runs: w.runs + 1, lastRun: Date.now(), status: 'active' } : w
        ),
      })),

      deleteWorkflow: (id) => set((s) => ({ workflows: s.workflows.filter((w) => w.id !== id) })),

      addConnection: (conn) => set((s) => ({
        connections: [...s.connections, { ...conn, id: uid(), lastSync: null }],
      })),

      removeConnection: (id) => set((s) => ({ connections: s.connections.filter((c) => c.id !== id) })),

      addStudioNode: (node) => set((s) => ({
        studioNodes: [...s.studioNodes, { ...node, id: uid(), connectedTo: [] }],
      })),

      connectNodes: (fromId, toId) => set((s) => ({
        studioNodes: s.studioNodes.map((n) =>
          n.id === fromId && !n.connectedTo.includes(toId)
            ? { ...n, connectedTo: [...n.connectedTo, toId] }
            : n
        ),
      })),

      moveNode: (id, x, y) => set((s) => ({
        studioNodes: s.studioNodes.map((n) => n.id === id ? { ...n, x, y } : n),
      })),

      deleteStudioNode: (id) => set((s) => ({
        studioNodes: s.studioNodes
          .filter((n) => n.id !== id)
          .map((n) => ({ ...n, connectedTo: n.connectedTo.filter((c) => c !== id) })),
      })),

      addChatMessage: (agentId, msg) => set((s) => {
        const prev = s.conversations[agentId] ?? []
        return {
          conversations: {
            ...s.conversations,
            [agentId]: [...prev, { ...msg, agentId, id: uid(), ts: Date.now() }],
          },
        }
      }),

      clearConversation: (agentId) => set((s) => ({
        conversations: { ...s.conversations, [agentId]: [] },
      })),
    }),
    { name: 'relay.v1' }
  )
)
