import { useState, useRef, useCallback } from 'react'
import { useRelayStore, type NodeType, type StudioNode } from '../relayStore'
import { Plus, Trash2 } from 'lucide-react'

const NODE_W = 130
const NODE_H = 42

const NODE_STYLE: Record<NodeType, { bg: string; border: string; text: string; dot: string }> = {
  trigger:   { bg: 'bg-emerald-950',  border: 'border-emerald-500/50', text: 'text-emerald-300',  dot: 'bg-emerald-400' },
  agent:     { bg: 'bg-violet-950',   border: 'border-violet-500/50',  text: 'text-violet-200',   dot: 'bg-violet-400' },
  condition: { bg: 'bg-amber-950',    border: 'border-amber-500/50',   text: 'text-amber-300',    dot: 'bg-amber-400' },
  action:    { bg: 'bg-cyan-950',     border: 'border-cyan-500/50',    text: 'text-cyan-300',     dot: 'bg-cyan-400' },
  output:    { bg: 'bg-zinc-900',     border: 'border-zinc-500/40',    text: 'text-zinc-300',     dot: 'bg-zinc-400' },
}

const NODE_ICON: Record<NodeType, string> = {
  trigger: '⚡', agent: '🤖', condition: '◈', action: '▶', output: '◉',
}

const PALETTE: { type: NodeType; label: string }[] = [
  { type: 'trigger', label: 'Trigger' },
  { type: 'agent', label: 'Agent' },
  { type: 'condition', label: 'Condition' },
  { type: 'action', label: 'Action' },
  { type: 'output', label: 'Output' },
]

function getBezier(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
}

export default function StudioView() {
  const { studioNodes, addStudioNode, moveNode, deleteStudioNode, connectNodes } = useRelayStore()
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newNodeLabel, setNewNodeLabel] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)

  const getSvgPoint = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  function onNodeMouseDown(e: React.MouseEvent, node: StudioNode) {
    e.stopPropagation()
    setSelectedId(node.id)
    if (connecting) {
      if (connecting !== node.id) connectNodes(connecting, node.id)
      setConnecting(null)
      return
    }
    const pt = getSvgPoint(e)
    setDragging({ id: node.id, ox: pt.x - node.x, oy: pt.y - node.y })
  }

  function onSvgMouseMove(e: React.MouseEvent) {
    if (!dragging) return
    const pt = getSvgPoint(e)
    moveNode(dragging.id, Math.max(0, pt.x - dragging.ox), Math.max(0, pt.y - dragging.oy))
  }

  function onSvgMouseUp() {
    setDragging(null)
  }

  function addNode(type: NodeType) {
    const label = newNodeLabel.trim() || type.charAt(0).toUpperCase() + type.slice(1)
    const x = 80 + Math.random() * 300
    const y = 80 + Math.random() * 200
    addStudioNode({ type, label, x, y })
    setNewNodeLabel('')
  }

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Palette sidebar */}
      <div className="flex w-52 flex-col border-r border-white/[0.06] bg-zinc-950 flex-shrink-0">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <p className="text-xs font-bold text-slate-300">Relay Studio</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Visual workflow builder</p>
        </div>

        <div className="px-3 py-3 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Node Label</p>
          <input
            placeholder="Optional label..."
            value={newNodeLabel}
            onChange={(e) => setNewNodeLabel(e.target.value)}
            title="Node label"
            aria-label="Node label"
            className="w-full rounded-lg border border-white/[0.08] bg-zinc-800 px-2 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none"
          />
        </div>

        <div className="px-3 py-3 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Add Node</p>
          <div className="flex flex-col gap-1.5">
            {PALETTE.map(({ type, label }) => {
              const s = NODE_STYLE[type]
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => addNode(type)}
                  className={`flex items-center gap-2 rounded-lg border ${s.border} ${s.bg} px-2.5 py-2 text-[11px] font-medium ${s.text} transition hover:opacity-80`}
                >
                  <span>{NODE_ICON[type]}</span>
                  <span>{label}</span>
                  <Plus size={10} className="ml-auto opacity-50" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Actions</p>
          {connecting ? (
            <div className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-2.5 py-2 text-[11px] text-violet-300">
              Click target node to connect...
              <button type="button" onClick={() => setConnecting(null)} className="ml-2 text-violet-500 hover:text-violet-300">✕</button>
            </div>
          ) : selectedId ? (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setConnecting(selectedId)}
                className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] text-cyan-300 hover:bg-cyan-500/20 transition"
              >
                Connect from this node
              </button>
              <button
                type="button"
                onClick={() => { deleteStudioNode(selectedId); setSelectedId(null) }}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-400 hover:bg-red-500/20 transition"
              >
                <Trash2 size={10} />
                Delete node
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-slate-600">Select a node to connect or delete it</p>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex flex-1 overflow-hidden relative bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.03)_0%,_transparent_70%)]">
        {/* Grid pattern */}
        <svg
          ref={svgRef}
          className="flex-1 cursor-crosshair select-none"
          onMouseMove={onSvgMouseMove}
          onMouseUp={onSvgMouseUp}
          onMouseLeave={onSvgMouseUp}
        >
          {/* Dot grid */}
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.04)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />

          {/* Connections */}
          {studioNodes.map((node) =>
            node.connectedTo.map((toId) => {
              const to = studioNodes.find((n) => n.id === toId)
              if (!to) return null
              const x1 = node.x + NODE_W
              const y1 = node.y + NODE_H / 2
              const x2 = to.x
              const y2 = to.y + NODE_H / 2
              return (
                <g key={`${node.id}-${toId}`}>
                  <path
                    d={getBezier(x1, y1, x2, y2)}
                    stroke="rgba(139,92,246,0.25)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="4 3"
                  />
                  <path
                    d={getBezier(x1, y1, x2, y2)}
                    stroke="rgba(139,92,246,0.5)"
                    strokeWidth="1"
                    fill="none"
                  />
                  {/* Arrow */}
                  <circle cx={x2} cy={y2} r="3" fill="rgba(139,92,246,0.6)" />
                </g>
              )
            })
          )}

          {/* Nodes as foreignObject */}
          {studioNodes.map((node) => {
            const s = NODE_STYLE[node.type]
            const isSelected = selectedId === node.id
            const isConnectingFrom = connecting === node.id
            return (
              <foreignObject
                key={node.id}
                x={node.x}
                y={node.y}
                width={NODE_W}
                height={NODE_H}
              >
                <div
                  onMouseDown={(e) => onNodeMouseDown(e, node)}
                  className={`flex h-full cursor-grab items-center gap-2 rounded-xl border px-3 text-[11px] font-semibold transition-all active:cursor-grabbing ${s.bg} ${s.border} ${s.text} ${isSelected ? 'ring-2 ring-violet-500/60 shadow-[0_0_16px_rgba(139,92,246,0.3)]' : ''} ${isConnectingFrom ? 'ring-2 ring-cyan-400/60' : ''}`}
                >
                  <span className="text-sm leading-none">{NODE_ICON[node.type]}</span>
                  <span className="truncate">{node.label}</span>
                  <span className={`ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                </div>
              </foreignObject>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-zinc-950/80 p-2.5 text-[10px] backdrop-blur-sm">
          {PALETTE.map(({ type, label }) => {
            const s = NODE_STYLE[type]
            return (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                <span className="text-slate-600">{label}</span>
              </div>
            )
          })}
        </div>

        {/* Instructions */}
        <div className="absolute top-3 left-3 rounded-xl border border-white/[0.04] bg-zinc-950/60 px-3 py-2 text-[10px] text-slate-600 backdrop-blur-sm">
          Drag nodes · Select + Connect · Add from palette
        </div>
      </div>
    </div>
  )
}
