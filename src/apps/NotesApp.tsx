import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit3, Check } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  color: string
}

const NOTE_COLORS = [
  'border-sky-500/30 bg-sky-500/5',
  'border-violet-500/30 bg-violet-500/5',
  'border-amber-500/30 bg-amber-500/5',
  'border-green-500/30 bg-green-500/5',
]

export default function NotesApp(_: { windowId: string }) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'TAURIQ OS Roadmap',
      content: 'Phase 1: Core desktop environment\nPhase 2: AI integration\nPhase 3: Native app ecosystem\nPhase 4: Linux port',
      createdAt: new Date(),
      color: NOTE_COLORS[0],
    },
    {
      id: '2',
      title: 'AI Architecture Notes',
      content: 'Local model support via llama.cpp\nAPI bridge: OpenAI, Anthropic\nAgent framework: LangChain compatible',
      createdAt: new Date(),
      color: NOTE_COLORS[1],
    },
  ])
  const [selected, setSelected] = useState<string | null>('1')
  const [editing, setEditing] = useState(false)

  const selectedNote = notes.find(n => n.id === selected)

  const createNote = () => {
    const id = Date.now().toString()
    const note: Note = {
      id,
      title: 'Untitled',
      content: '',
      createdAt: new Date(),
      color: NOTE_COLORS[notes.length % NOTE_COLORS.length],
    }
    setNotes(prev => [...prev, note])
    setSelected(id)
    setEditing(true)
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selected === id) setSelected(notes[0]?.id ?? null)
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n))
  }

  return (
    <div className="flex h-full">
      {/* Note list */}
      <div className="w-52 border-r border-white/[0.06] flex flex-col">
        <div className="h-10 border-b border-white/[0.06] flex items-center justify-between px-3">
          <span className="text-[10px] font-mono text-slate-600 tracking-widest">NOTES</span>
          <button
            onClick={createNote}
            className="p-1 rounded text-slate-600 hover:text-sky-400 hover:bg-sky-500/10 transition-all"
          >
            <Plus size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {notes.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => { setSelected(note.id); setEditing(false) }}
              className={`p-2 rounded-lg cursor-pointer border transition-all ${
                selected === note.id
                  ? 'bg-sky-500/10 border-sky-500/20'
                  : 'border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <p className="text-xs text-slate-300 font-medium truncate">{note.title}</p>
              <p className="text-[10px] text-slate-600 truncate mt-0.5">{note.content.split('\n')[0]}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            <div className="h-10 border-b border-white/[0.06] flex items-center justify-between px-4">
              {editing ? (
                <input
                  className="flex-1 bg-transparent text-sm text-slate-200 font-medium outline-none"
                  value={selectedNote.title}
                  onChange={e => updateNote(selectedNote.id, { title: e.target.value })}
                  autoFocus
                />
              ) : (
                <span className="text-sm text-slate-200 font-medium truncate">{selectedNote.title}</span>
              )}
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className={`p-1 rounded transition-all ${editing ? 'text-sky-400' : 'text-slate-600 hover:text-slate-300'}`}
                >
                  {editing ? <Check size={13} /> : <Edit3 size={13} />}
                </button>
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="p-1 rounded text-slate-700 hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {editing ? (
                <textarea
                  className="w-full h-full bg-transparent text-sm text-slate-300 outline-none resize-none leading-6"
                  value={selectedNote.content}
                  onChange={e => updateNote(selectedNote.id, { content: e.target.value })}
                  placeholder="Start writing..."
                />
              ) : (
                <pre className="text-sm text-slate-300 leading-6 whitespace-pre-wrap font-sans">
                  {selectedNote.content || <span className="text-slate-700">No content — click edit to begin</span>}
                </pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-700 font-mono">
            select or create a note
          </div>
        )}
      </div>
    </div>
  )
}
