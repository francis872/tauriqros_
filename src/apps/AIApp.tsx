import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Volume2, VolumeX, Radio } from 'lucide-react'
import { useRuntimeCoreStore } from '../runtime/runtimeCoreStore'
import { useDesktopStore } from '../store/desktopStore'
import { querySystemIntelligence } from '../ai/system/tauriqSystemLLM'
import { useMyLynkAuth } from './mylynk/mylynkAuthStore'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

const SUGGESTIONS = [
  'hola, \u00bfqué puedes hacer?',
  'mis tareas pendientes en Balance',
  'agentes activos en RELAY',
  'estado del sistema',
  'apps abiertas',
  'mi cuenta MY-LYNK',
]

// ─── Female voice selector ────────────────────────────────────────────────────
const FEMALE_KEYWORDS = ['helena', 'laura', 'lucía', 'lucia', 'paulina', 'zira', 'samantha',
  'mónica', 'monica', 'maría', 'maria', 'rosa', 'female', 'mujer', 'woman', 'sabina', 'ines',
  'inés', 'paloma', 'elvira', 'conchita', 'esperanza', 'jorge' /* nope */, 'nuria', 'valeria']

function pickFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const es = voices.filter((v) => v.lang.startsWith('es'))
  // Prefer online/cloud voices (better quality)
  const online = es.find((v) => !v.localService && FEMALE_KEYWORDS.some((k) => v.name.toLowerCase().includes(k)))
  if (online) return online
  // Local female Spanish voice
  const local = es.find((v) => FEMALE_KEYWORDS.some((k) => v.name.toLowerCase().includes(k)))
  if (local) return local
  // Any online Spanish voice
  const anyOnline = es.find((v) => !v.localService)
  if (anyOnline) return anyOnline
  // Any Spanish voice
  if (es.length) return es[0]
  // Fallback to any online voice
  return voices.find((v) => !v.localService) ?? voices[0]
}

export default function AIApp(_: { windowId: string }) {
  const coreSnapshot = useRuntimeCoreStore((state) => state.coreSnapshot)
  const currentAccount = useMyLynkAuth((s) => s.currentAccount)
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'system', content: '⬡  ROSS — AI de Tauriq OS · voz femenina activa · llama3.2:1b local' },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [conversationMode, setConversationMode] = useState(false)
  const recognitionRef = useRef<any>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const conversationModeRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const windows = useDesktopStore((s) => s.windows)
  const activeWorkspaceId = useDesktopStore((s) => s.activeWorkspaceId)
  const activeLayoutId = useDesktopStore((s) => s.activeLayoutId)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])
  useEffect(() => { inputRef.current?.focus() }, [])

  // Load voices (async in Chromium)
  useEffect(() => {
    const load = () => { voicesRef.current = window.speechSynthesis?.getVoices() ?? [] }
    load()
    window.speechSynthesis?.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load)
  }, [])

  // Keep conversationModeRef in sync
  useEffect(() => { conversationModeRef.current = conversationMode }, [conversationMode])

  // ─── TTS ─────────────────────────────────────────────────────────────────
  const speakResponse = (text: string, onDone?: () => void) => {
    const synth = window.speechSynthesis
    if (!ttsEnabled || !synth) { onDone?.(); return }
    synth.cancel()
    const clean = text.replace(/[_*`#\n]/g, ' ').trim()
    if (!clean) { onDone?.(); return }
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang = 'es-ES'
    utterance.rate = 1.0
    utterance.pitch = 1.1  // slightly higher = more feminine
    utterance.volume = 1.0
    const voice = pickFemaleVoice(voicesRef.current)
    if (voice) utterance.voice = voice
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => { setSpeaking(false); onDone?.() }
    utterance.onerror = () => { setSpeaking(false); onDone?.() }
    synth.speak(utterance)
  }

  // Auto-start listening again after ROSS finishes speaking (conversation mode)
  const speakAndListen = (text: string) => {
    speakResponse(text, () => {
      if (conversationModeRef.current) {
        setTimeout(() => startListening(), 400)
      }
    })
  }

  // ─── STT ─────────────────────────────────────────────────────────────────
  const startListening = () => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'system',
        content: '⚠ Reconocimiento de voz requiere Chrome o Edge (no funciona en el preview de VS Code).' }])
      return
    }
    if (recognitionRef.current) { recognitionRef.current.abort(); return }

    const rec = new SR()
    rec.lang = 'es-ES'
    rec.continuous = false
    rec.interimResults = true

    rec.onstart = () => setListening(true)
    rec.onresult = (e: any) => {
      const last = e.results[e.results.length - 1]
      const text: string = last[0].transcript
      setInput(text)
      if (last.isFinal) {
        setInput('')
        recognitionRef.current = null
        setListening(false)
        sendText(text)
      }
    }
    rec.onerror = (e: any) => {
      recognitionRef.current = null; setListening(false); setInput('')
      const msg = e.error === 'not-allowed'
        ? '⚠ Permiso de micrófono denegado — habilítalo en el candado de la barra del navegador.'
        : e.error === 'network' ? '⚠ Error de red en STT. Verifica conexión.' : `⚠ Error: ${e.error}`
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'system', content: msg }])
    }
    rec.onend = () => { if (recognitionRef.current === rec) { recognitionRef.current = null; setListening(false) } }
    recognitionRef.current = rec
    rec.start()
  }

  const toggleListening = () => {
    if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null; setListening(false) }
    else startListening()
  }

  // ─── Send ─────────────────────────────────────────────────────────────────
  const sendText = async (text: string) => {
    if (!text.trim() || thinking) return
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }])
    setThinking(true)

    // Build conversation history from current messages (skip the initial system message)
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content.replace(/\n\n_ROSS ·.*_$/, '').trim() }))

    const result = await querySystemIntelligence(text, coreSnapshot, {
      model: 'llama3.2:1b',
      openWindows: windows,
      activeWorkspace: activeWorkspaceId,
      activeLayoutId,
      conversationHistory: history,
    })
    const answer = result.answer + (result.fromFallback
      ? '\n\n_(offline · inicia Ollama para inferencia completa)_'
      : `\n\n_ROSS · ${result.modelId} · ${result.latencyMs}ms_`)
    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: answer }])
    setThinking(false)
    speakAndListen(result.answer)
  }

  const send = async () => {
    const text = input.trim()
    setInput('')
    await sendText(text)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-12 border-b border-white/[0.06] flex items-center px-4 gap-2 shrink-0">
        {/* ROSS identity */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20">
            <span className="text-[11px]">⬡</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-sky-300 leading-none">ROSS</p>
            <p className="text-[8px] text-slate-600 leading-none mt-0.5">AI · Tauriq OS</p>
          </div>
        </div>
        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] text-emerald-400">
          llama3.2:1b · local
        </span>
        {currentAccount && (
          <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[8px] text-violet-300">
            {currentAccount.displayName}
          </span>
        )}

        {/* State indicator */}
        {speaking && (
          <span className="flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[9px] text-sky-300">
            <span className="flex gap-0.5 items-end h-3">
              {[0,1,2,3].map((i) => (
                <motion.span key={i} animate={{ scaleY: [0.3,1,0.3] }} transition={{ duration: 0.5, delay: i*0.1, repeat: Infinity }}
                  className="inline-block w-0.5 bg-sky-400 rounded-full origin-bottom" style={{ height: '100%' }} />
              ))}
            </span>
            hablando
          </span>
        )}
        {listening && (
          <span className="flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[9px] text-red-300">
            <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
            escuchando
          </span>
        )}
        {thinking && (
          <span className="flex items-center gap-1.5 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[9px] text-violet-300">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-2 h-2 border border-violet-400 border-t-transparent rounded-full" />
            pensando
          </span>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {/* Conversation mode */}
          <button
            onClick={() => {
              const next = !conversationMode
              setConversationMode(next)
              if (next) speakResponse('Modo conversación activado. Te escucho.')
            }}
            title={conversationMode ? 'Desactivar modo conversación' : 'Activar conversación continua por voz'}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors ${conversationMode ? 'border-violet-500/40 bg-violet-500/15 text-violet-300' : 'border-white/[0.06] text-slate-600 hover:text-slate-400'}`}
          >
            <Radio size={9} />
            {conversationMode ? 'On' : 'Voz'}
          </button>
          {/* TTS toggle */}
          <button onClick={() => { setTtsEnabled((p) => !p); window.speechSynthesis?.cancel(); setSpeaking(false) }}
            title={ttsEnabled ? 'Silenciar' : 'Activar voz'}
            className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${ttsEnabled ? 'border-sky-500/30 bg-sky-500/10 text-sky-300' : 'border-white/[0.06] text-slate-600'}`}>
            {ttsEnabled ? <Volume2 size={11} /> : <VolumeX size={11} />}
          </button>
          {/* Test voice */}
          <button onClick={() => speakResponse('Hola, soy ROSS, el AI de Tauriq OS.')}
            title="Probar voz"
            className="flex h-6 px-2 items-center rounded-md border border-white/[0.06] text-[9px] text-slate-600 hover:text-sky-400 hover:border-sky-500/20 transition-colors">
            test
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role !== 'user' && (
              <div className="flex h-6 w-6 shrink-0 mt-0.5 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px]">⬡</div>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-sky-500/10 border border-sky-500/20 text-sky-100 rounded-tr-sm'
                : msg.role === 'system'
                  ? 'text-slate-600 font-mono text-[10px] bg-transparent px-0 py-1'
                  : 'bg-white/[0.04] border border-white/[0.06] text-slate-300 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* Thinking indicator */}
        <AnimatePresence>
          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px]">⬡</div>
              <div className="flex items-center gap-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
                    className="w-1 h-1 rounded-full bg-sky-400" />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => { setInput(s); inputRef.current?.focus() }}
            className="shrink-0 px-2 py-1 rounded-lg text-[10px] font-mono text-slate-600 border border-white/[0.06] hover:border-sky-500/20 hover:text-sky-400 transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/[0.06] shrink-0">
        <div className="flex gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-sky-500/30 transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={listening ? '🎙 Escuchando...' : 'Habla o escribe a ROSS...'}
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-700"
          />
          {/* Mic button */}
          <button
            onClick={toggleListening}
            title={listening ? 'Detener escucha' : 'Hablar con ROSS'}
            className={`transition-colors ${listening ? 'text-red-400 animate-pulse' : 'text-slate-600 hover:text-sky-400'}`}
          >
            {listening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
          <button
            onClick={send}
            disabled={!input.trim() || thinking}
            title="Send AI prompt"
            className="text-sky-400/60 hover:text-sky-400 disabled:opacity-30 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
