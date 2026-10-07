import { useEffect, useRef, useMemo, useState } from 'react'
import { Sparkles, Languages, Wand2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAcordStore, type LiryqLang } from '../acordStore'

const LANG_LABELS: Record<LiryqLang, string> = { es: 'ES', en: 'EN', fr: 'FR', pt: 'PT' }
const MOOD_COLORS: Record<string, string> = {
  violet: 'from-violet-900/40 to-transparent border-violet-500/20 text-violet-300',
  cyan: 'from-cyan-900/40 to-transparent border-cyan-500/20 text-cyan-300',
  amber: 'from-amber-900/40 to-transparent border-amber-500/20 text-amber-300',
  blue: 'from-blue-900/40 to-transparent border-blue-500/20 text-blue-300',
  rose: 'from-rose-900/40 to-transparent border-rose-500/20 text-rose-300',
  emerald: 'from-emerald-900/40 to-transparent border-emerald-500/20 text-emerald-300',
}

export default function LiryqView() {
  const {
    currentTrack, position, isPlaying, liryqLang,
    setLiryqLang, showGeneratedVerse, toggleGeneratedVerse, resume, pause,
  } = useAcordStore()

  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [generatingAnim, setGeneratingAnim] = useState(false)

  const activeLyricIndex = useMemo(() => {
    if (!currentTrack?.lyrics) return 0
    const lines = currentTrack.lyrics
    let idx = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= position) idx = i
    }
    return idx
  }, [currentTrack, position])

  // Auto-scroll to active line
  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeLyricIndex])

  const handleGenerate = () => {
    setGeneratingAnim(true)
    setTimeout(() => {
      setGeneratingAnim(false)
      if (!showGeneratedVerse) toggleGeneratedVerse()
    }, 1400)
  }

  if (!currentTrack) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <Sparkles size={40} className="text-slate-700" />
        <p className="text-sm text-slate-500">Reproduce una canción para ver Liryq IA</p>
      </div>
    )
  }

  if (!currentTrack.lyrics || !currentTrack.liryqAnalysis) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-8">
        <Sparkles size={40} className="text-violet-700/40" />
        <p className="text-sm font-medium text-slate-400">{currentTrack.title}</p>
        <p className="text-xs text-slate-600">Liryq IA no tiene letras ni análisis para canciones de Spotify.</p>
        <p className="text-[10px] text-slate-700 max-w-xs leading-relaxed">
          Las letras sincronizadas y el análisis emocional están disponibles únicamente para las canciones de la biblioteca local de Acordd.
        </p>
        {currentTrack.previewUrl && (
          <div className="mt-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-2.5 text-xs text-green-400">
            Vista previa de 30s disponible — usa el reproductor abajo
          </div>
        )}
      </div>
    )
  }

  const { lyrics, liryqAnalysis } = currentTrack
  const [fromG, toG] = currentTrack.coverGradient
  const moodClass = MOOD_COLORS[liryqAnalysis.moodColor] ?? MOOD_COLORS.violet
  const translatedLines = liryqLang === 'es' ? lyrics.map((l) => l.text) : (liryqAnalysis.translations[liryqLang] ?? lyrics.map((l) => l.text))

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${fromG}22 0%, #080610 40%)` }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(ellipse at 30% 0%, ${fromG}80, transparent 60%)` }}
      />

      {/* Header */}
      <div className="relative flex flex-shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Sparkles size={16} className="text-cyan-400" />
          <span className="text-sm font-bold text-slate-100">Liryq IA</span>
          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono uppercase text-cyan-400 border border-cyan-500/20">
            Letras · Análisis · Traducción · Generación
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.08] transition-colors"
            >
              <Languages size={12} />
              {LANG_LABELS[liryqLang]}
              <ChevronDown size={11} />
            </button>
            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0e0b1e] shadow-2xl"
                >
                  {(Object.keys(LANG_LABELS) as LiryqLang[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLiryqLang(lang); setLangMenuOpen(false) }}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${liryqLang === lang ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'}`}
                    >
                      {LANG_LABELS[lang]}
                      <span className="text-xs text-slate-600">
                        {{ es: 'Español', en: 'English', fr: 'Français', pt: 'Português' }[lang]}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Play/pause */}
          <button
            onClick={() => (isPlaying ? pause() : resume())}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              isPlaying
                ? 'border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20'
                : 'border border-white/[0.1] bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            {isPlaying ? '⏸ Pausar' : '▶ Reproducir'}
          </button>
        </div>
      </div>

      {/* Track info strip */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-white/[0.04] px-5 py-2.5">
        <div className="h-8 w-8 flex-shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${fromG}, ${toG})` }} />
        <div>
          <p className="text-sm font-semibold text-slate-200">{currentTrack.title}</p>
          <p className="text-[10px] text-slate-500">{currentTrack.artist} · {currentTrack.album}</p>
        </div>
        <div className="ml-auto flex gap-1.5">
          {currentTrack.moods.map((m) => (
            <span key={m} className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[9px] text-slate-500">{m}</span>
          ))}
        </div>
      </div>

      {/* Main body: lyrics + analysis */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Lyrics pane ── */}
        <div
          ref={lyricsContainerRef}
          className="flex flex-1 flex-col overflow-y-auto px-6 py-5 no-scrollbar"
        >
          <p className="mb-4 text-[9px] font-mono uppercase tracking-[0.22em] text-slate-600">
            {liryqLang === 'es' ? 'Letra Original' : `Traducción · ${LANG_LABELS[liryqLang]}`}
          </p>
          {lyrics.map((line, i) => {
            const isActive = i === activeLyricIndex
            const isPast = i < activeLyricIndex
            const displayText = translatedLines[i] ?? line.text
            return (
              <div
                key={i}
                ref={isActive ? activeLineRef : undefined}
                className="py-1 transition-all duration-300"
              >
                <p
                  className={`text-lg font-medium leading-relaxed transition-all duration-300 ${
                    isActive
                      ? 'text-white drop-shadow-[0_0_12px_rgba(167,139,250,0.8)] scale-[1.02] origin-left'
                      : isPast
                      ? 'text-slate-700'
                      : 'text-slate-500'
                  }`}
                >
                  {displayText}
                </p>
              </div>
            )
          })}
          <div className="h-20" />
        </div>

        {/* ── Analysis pane ── */}
        <div className="w-72 flex-shrink-0 overflow-y-auto border-l border-white/[0.06] px-4 py-5 no-scrollbar xl:w-80">
          {/* Mood */}
          <div className={`mb-4 rounded-2xl border bg-gradient-to-b px-4 py-3 ${moodClass}`}>
            <p className="mb-0.5 text-[9px] font-mono uppercase tracking-[0.2em] opacity-70">Estado Emocional</p>
            <p className="text-base font-bold">{liryqAnalysis.mood}</p>
          </div>

          {/* Themes */}
          <div className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <p className="mb-2 text-[9px] font-mono uppercase tracking-[0.18em] text-slate-600">Temas</p>
            <div className="flex flex-wrap gap-1.5">
              {liryqAnalysis.themes.map((theme) => (
                <span key={theme} className="rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-300">
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Emotional arc */}
          <div className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <p className="mb-1.5 text-[9px] font-mono uppercase tracking-[0.18em] text-slate-600">Arco Emocional</p>
            <p className="text-xs leading-relaxed text-slate-400">{liryqAnalysis.emotionalArc}</p>
          </div>

          {/* Cultural context */}
          <div className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <p className="mb-1.5 text-[9px] font-mono uppercase tracking-[0.18em] text-slate-600">Contexto Cultural</p>
            <p className="text-xs leading-relaxed text-slate-400">{liryqAnalysis.culturalContext}</p>
          </div>

          {/* Significance */}
          <div className="mb-5 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3">
            <p className="mb-1.5 text-[9px] font-mono uppercase tracking-[0.18em] text-cyan-500/70">Significado Profundo</p>
            <p className="text-xs leading-relaxed text-slate-300">{liryqAnalysis.significance}</p>
          </div>

          {/* Generate verse */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wand2 size={13} className="text-violet-400" />
                <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-violet-400">Liryq Genera</p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generatingAnim}
                className="rounded-lg bg-violet-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
              >
                {generatingAnim ? '···' : 'Generar'}
              </button>
            </div>

            <AnimatePresence>
              {generatingAnim && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {[60, 80, 50, 70].map((w, i) => (
                    <div key={i} className="h-3 animate-pulse rounded-full bg-violet-500/20" style={{ width: `${w}%` }} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showGeneratedVerse && !generatingAnim && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {liryqAnalysis.generatedVerse.split('\n').map((line, i) => (
                    <p key={i} className="text-xs leading-7 text-slate-300 italic">{line}</p>
                  ))}
                  <p className="mt-2 text-[9px] text-slate-600">— Generado por Liryq IA en el estilo de {currentTrack.artist}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!showGeneratedVerse && !generatingAnim && (
              <p className="text-[11px] text-slate-600">
                Liryq puede generar una estrofa nueva en el estilo de {currentTrack.artist}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
