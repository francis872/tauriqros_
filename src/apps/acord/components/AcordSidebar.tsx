import { Home, Search, Library, Compass, Music2, Sparkles, ListMusic, Heart } from 'lucide-react'
import { useAcordStore, type AcordView } from '../acordStore'
import { PLAYLISTS } from '../acordMockData'

const NAV = [
  { id: 'home' as AcordView, label: 'Inicio', Icon: Home },
  { id: 'search' as AcordView, label: 'Buscar', Icon: Search },
  { id: 'library' as AcordView, label: 'Biblioteca', Icon: Library },
  { id: 'explore' as AcordView, label: 'Explorar', Icon: Compass },
]

export default function AcordSidebar() {
  const { activeView, setView, likedTrackIds } = useAcordStore()

  return (
    <aside className="flex w-52 flex-shrink-0 flex-col border-r border-white/[0.06] bg-[#06040e]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600">
          <Music2 size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-white">Acordd</p>
          <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-violet-300/70">con Liryq IA</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="p-2 space-y-0.5">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
              activeView === id
                ? 'bg-violet-600/20 text-violet-200'
                : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Liryq IA button */}
      <div className="px-2 pb-2">
        <button
          onClick={() => setView('liryq')}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
            activeView === 'liryq'
              ? 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-500/40'
              : 'text-cyan-300/70 hover:bg-cyan-500/10 hover:text-cyan-200'
          }`}
        >
          <Sparkles size={16} />
          Liryq IA
          <span className="ml-auto rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300">AI</span>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/[0.06]" />

      {/* Playlists */}
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        <p className="mb-1 px-3 pt-2 text-[9px] font-mono uppercase tracking-[0.18em] text-slate-600">Playlists</p>

        {/* Liked songs */}
        <button
          onClick={() => setView('library')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs transition-all text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-700">
            <Heart size={11} className="fill-white text-white" />
          </div>
          <span className="truncate">Canciones que te gustan</span>
          <span className="ml-auto text-[10px] text-slate-600">{likedTrackIds.length}</span>
        </button>

        {PLAYLISTS.slice(1).map((pl) => (
          <button
            key={pl.id}
            onClick={() => setView('library')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs transition-all text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
          >
            <div
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: pl.color + '33' }}
            >
              <ListMusic size={11} style={{ color: pl.color }} />
            </div>
            <span className="truncate">{pl.title}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
