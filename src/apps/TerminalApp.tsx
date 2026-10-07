import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TerminalLine {
  id: string
  type: 'input' | 'output' | 'error' | 'system'
  content: string
}

const COMMANDS: Record<string, () => string> = {
  help: () => 'commands: help  clear  whoami  uname  date  ls  pwd  echo  neofetch  ai',
  whoami: () => 'tauriq-user',
  uname: () => 'TAURIQ OS v0.1.0-alpha (AI-Native Desktop Environment)',
  date: () => new Date().toString(),
  pwd: () => '/home/tauriq',
  ls: () => 'Desktop/   Documents/   Downloads/   Projects/   .tauriq/   .config/',
  neofetch: () => `
  ████████╗  OS: TAURIQ OS v0.1.0-alpha
     ██╔══╝  Kernel: AI-Native Runtime
     ██║     Shell: tauriq-shell v1.0
     ██║     DE: TAURIQ Desktop
  ╚══╝  Theme: Void Dark
         Memory: simulated / virtual
         AI: neural bridge active`.trim(),
  ai: () => 'TAURIQ AI — neural bridge is in standby. Full integration in next build.',
}

export default function TerminalApp(_: { windowId: string }) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '0', type: 'system', content: '⬡  TAURIQ Terminal v0.1 · type "help" for available commands' },
    { id: '1', type: 'system', content: '─────────────────────────────────────────────────────────' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines])
  useEffect(() => { inputRef.current?.focus() }, [])

  const execute = (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    setHistory(h => [trimmed, ...h.slice(0, 49)])
    setHistoryIdx(-1)

    const inputLine: TerminalLine = { id: `${Date.now()}`, type: 'input', content: trimmed }

    if (trimmed === 'clear') {
      setLines([{ id: `${Date.now()}`, type: 'system', content: '⬡  TAURIQ Terminal v0.1 · cleared' }])
      return
    }

    const [cmd0, ...args] = trimmed.split(' ')
    let output: string

    if (cmd0 === 'echo') {
      output = args.join(' ')
    } else if (COMMANDS[cmd0]) {
      output = COMMANDS[cmd0]()
    } else {
      output = `command not found: ${cmd0} · type 'help'`
    }

    const outLine: TerminalLine = {
      id: `${Date.now() + 1}`,
      type: COMMANDS[cmd0] ? 'output' : 'error',
      content: output,
    }
    setLines(prev => [...prev, inputLine, outLine])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      setInput(idx === -1 ? '' : history[idx] ?? '')
    }
  }

  const lineColors: Record<string, string> = {
    input: 'text-sky-400',
    output: 'text-slate-300',
    error: 'text-red-400/80',
    system: 'text-slate-600',
  }

  return (
    <div
      className="h-full bg-[#080810] flex flex-col font-mono text-sm cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5 no-scrollbar">
        {lines.map(line => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className={`leading-5 whitespace-pre-wrap ${lineColors[line.type]}`}
          >
            {line.type === 'input' && (
              <span className="text-violet-400/60 select-none">tauriq@os ~ $ </span>
            )}
            {line.content}
          </motion.div>
        ))}

        {/* Input row */}
        <div className="flex items-center gap-0 pt-0.5">
          <span className="text-violet-400/60 select-none">tauriq@os ~ $ </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            title="Terminal command input"
            aria-label="Terminal command input"
            placeholder="Type a command"
            className="flex-1 bg-transparent outline-none text-slate-200 caret-sky-400"
            spellCheck={false}
            autoCapitalize="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
