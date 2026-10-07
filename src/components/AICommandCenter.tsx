import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Send, Command } from 'lucide-react'
import { cn } from '../utils/cn'
import { scaleIn } from '../animations/variants'

interface Message {
  id: string
  type: 'user' | 'ai' | 'system'
  text: string
  timestamp: Date
}

const SUGGESTIONS = [
  'Open terminal',
  'Show system stats',
  'Create new workspace',
  'Search files',
  'Run automation script',
]

const AI_RESPONSES: Record<string, string> = {
  default: 'Command acknowledged. AI subsystems are in standby mode — full integration coming in the next build.',
}

export default function AICommandCenter() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', type: 'system', text: 'TAURIQ AI v0.1 — Neural bridge initialized. Type a command or ask anything.', timestamp: new Date() },
  ])
  const [isThinking, setIsThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = { id: Date.now().toString(), type: 'user', text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsThinking(true)

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: AI_RESPONSES.default,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
      setIsThinking(false)
    }, 900)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full widget-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <Zap size={14} className="text-sky-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white font-mono tracking-wide">AI Command Center</h3>
          <p className="text-[10px] text-slate-600">Neural bridge ready</p>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'text-xs font-mono rounded-lg px-3 py-2',
                msg.type === 'user' && 'bg-sky-500/10 border border-sky-500/20 text-sky-300 ml-4',
                msg.type === 'ai' && 'bg-white/[0.03] border border-white/[0.06] text-slate-300',
                msg.type === 'system' && 'text-slate-600 text-[10px] italic'
              )}
            >
              {msg.type === 'user' && <span className="text-sky-500/60 mr-1">{'>'}</span>}
              {msg.type === 'ai' && <span className="text-violet-400/60 mr-1">AI</span>}
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-2"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-sky-400"
              />
            ))}
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="flex gap-1.5 flex-wrap mt-3 mb-2">
        {SUGGESTIONS.slice(0, 3).map(s => (
          <button
            key={s}
            onClick={() => setInput(s)}
            className="text-[10px] font-mono px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-sky-500/20 transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 hover:border-sky-500/20 transition-all focus-within:border-sky-500/30">
        <Command size={12} className="text-slate-600 shrink-0" />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask AI or type a command..."
          className="flex-1 bg-transparent text-xs font-mono text-slate-200 placeholder:text-slate-700 outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={sendMessage}
          disabled={!input.trim()}
          className="text-sky-500 hover:text-sky-400 disabled:text-slate-700 transition-colors"
        >
          <Send size={12} />
        </motion.button>
      </div>
    </motion.div>
  )
}
