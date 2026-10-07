import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'
import { scaleIn } from '../animations/variants'

interface TerminalLine {
  id: string
  type: 'input' | 'output' | 'error' | 'system'
  content: string
}

const COMMANDS: Record<string, string> = {
  help: 'Available: help, clear, whoami, uname, date, echo <text>',
  whoami: 'tauriq-user',
  uname: 'TAURIQ OS v0.1.0-alpha (AI-Native)',
  date: new Date().toUTCString(),
  pwd: '/home/tauriq',
  ls: 'Desktop  Documents  Downloads  Projects  .tauriq',
}

export default function TerminalWindow() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '0', type: 'system', content: '⬡ TAURIQ Terminal v0.1 — type "help" for commands' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const execute = (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    setHistory(h => [trimmed, ...h.slice(0, 49)])
    setHistoryIdx(-1)

    const inputLine: TerminalLine = { id: Date.now().toString(), type: 'input', content: trimmed }

    let output: TerminalLine

    if (trimmed === 'clear') {
      setLines([{ id: Date.now().toString(), type: 'system', content: '⬡ TAURIQ Terminal v0.1 — cleared' }])
      return
    } else if (trimmed.startsWith('echo ')) {
      output = { id: (Date.now() + 1).toString(), type: 'output', content: trimmed.slice(5) }
    } else if (COMMANDS[trimmed]) {
      output = { id: (Date.now() + 1).toString(), type: 'output', content: COMMANDS[trimmed] }
    } else {
      output = { id: (Date.now() + 1).toString(), type: 'error', content: `tauriq: command not found: ${trimmed}` }
    }

    setLines(prev => [...prev, inputLine, output])
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execute(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(historyIdx + 1, history.length - 1)
      setHistoryIdx(idx)
      setInput(history[idx] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(historyIdx - 1, -1)
      setHistoryIdx(idx)
      setInput(idx === -1 ? '' : history[idx])
    }
  }

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden border border-white/[0.07]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02] shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60 hover:bg-amber-500 transition-colors cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60 hover:bg-emerald-500 transition-colors cursor-pointer" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 text-xs font-mono text-slate-600">
          <Terminal size={11} />
          <span>tauriq — bash</span>
        </div>
      </div>

      {/* Terminal body */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 font-mono text-xs">
        {lines.map(line => (
          <div key={line.id} className="mb-1 leading-relaxed">
            {line.type === 'input' && (
              <span>
                <span className="text-sky-500">tauriq</span>
                <span className="text-slate-600">@os</span>
                <span className="text-slate-700">:</span>
                <span className="text-violet-400">~</span>
                <span className="text-slate-600"> $ </span>
                <span className="text-white">{line.content}</span>
              </span>
            )}
            {line.type === 'output' && <span className="text-slate-300">{line.content}</span>}
            {line.type === 'error' && <span className="text-red-400">{line.content}</span>}
            {line.type === 'system' && <span className="text-sky-500/60">{line.content}</span>}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex items-center">
          <span className="text-sky-500">tauriq</span>
          <span className="text-slate-600">@os</span>
          <span className="text-slate-700">:</span>
          <span className="text-violet-400">~</span>
          <span className="text-slate-600"> $ </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            title="Terminal command input"
            aria-label="Terminal command input"
            placeholder="Type a command"
            className="flex-1 bg-transparent text-white outline-none caret-sky-400"
            autoComplete="off"
            spellCheck={false}
          />
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-4 bg-sky-400/80 rounded-sm ml-0.5"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </motion.div>
  )
}
