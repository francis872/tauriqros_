import { useState } from 'react'
import { motion } from 'framer-motion'
import { StickyNote, Plus } from 'lucide-react'

export default function NotesWidget() {
  const [notes, setNotes] = useState(['Design AI pipeline', 'Review widget architecture'])
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const addNote = () => {
    if (draft.trim()) {
      setNotes(prev => [draft.trim(), ...prev])
    }
    setDraft('')
    setAdding(false)
  }

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote size={13} className="text-amber-400" />
          <span className="text-xs font-mono text-slate-400">Notes</span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
        >
          <Plus size={11} />
        </button>
      </div>

      {adding && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addNote(); if (e.key === 'Escape') setAdding(false) }}
            onBlur={addNote}
            placeholder="New note..."
            className="w-full bg-white/[0.04] border border-amber-500/20 rounded px-2 py-1 text-xs font-mono text-slate-300 placeholder:text-slate-700 outline-none"
          />
        </motion.div>
      )}

      <div className="space-y-1.5">
        {notes.slice(0, 3).map((note, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 text-xs font-mono text-slate-500 group"
          >
            <div className="w-1 h-1 rounded-full bg-amber-500/50 shrink-0" />
            <span className="truncate">{note}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
