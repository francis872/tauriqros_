import { useEffect } from 'react'
import { useAcordStore } from './acordStore'
import AcordSidebar from './components/AcordSidebar'
import PlayerBar from './components/PlayerBar'
import YTPlayerBridge from './components/YTPlayerBridge'
import HomeView from './views/HomeView'
import SearchView from './views/SearchView'
import LibraryView from './views/LibraryView'
import ExploreView from './views/ExploreView'
import LiryqView from './views/LiryqView'

export default function AcordApp({ windowId: _windowId }: { windowId: string }) {
  const { activeView, tick } = useAcordStore()

  // Player clock — advances position every second
  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#080610] text-slate-200">
      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <AcordSidebar />
        <main className="flex-1 overflow-hidden">
          {activeView === 'home'    && <HomeView />}
          {activeView === 'search'  && <SearchView />}
          {activeView === 'library' && <LibraryView />}
          {activeView === 'explore' && <ExploreView />}
          {activeView === 'liryq'   && <LiryqView />}
        </main>
      </div>
      {/* Player bar */}
      <PlayerBar />
      {/* Hidden YouTube IFrame player — mounts once, persists for lifetime of app */}
      <YTPlayerBridge />
    </div>
  )
}
