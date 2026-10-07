import { useState } from 'react'
import { Globe, ExternalLink } from 'lucide-react'

interface BrowserAppProps {
  windowId: string
}

export default function BrowserApp({ windowId: _windowId }: BrowserAppProps) {
  const [isLaunching, setIsLaunching] = useState(false)
  const [message, setMessage] = useState('')

  const launchASCCIR = async () => {
    setIsLaunching(true)
    setMessage('Launching ASCCI-R Browser...')
    setTimeout(() => {
      setIsLaunching(false)
      setMessage('ASCCI-R opened in separate window')
    }, 1500)
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-[#0a0e27] to-[#141821]">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-gradient-to-br from-cyan-600 to-blue-600 rounded">
            <Globe size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-cyan-100">ASCCI-R Browser</h1>
            <p className="text-cyan-400/60 text-xs">Advanced System Communication & Computing Interface</p>
          </div>
        </div>

        {/* Launch Section */}
        <div className="bg-[#1a1f2e] border border-cyan-900/30 rounded p-3">
          <p className="text-cyan-300/80 text-xs leading-relaxed mb-3">
            High-performance browser optimized for TAURIQ integration. Runs as a native application.
          </p>
          <button
            onClick={launchASCCIR}
            disabled={isLaunching}
            className="w-full px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            <ExternalLink size={14} />
            {isLaunching ? 'Launching...' : 'Launch ASCCI-R'}
          </button>
          {message && (
            <p className="mt-2 text-cyan-400 text-xs text-center animate-pulse">{message}</p>
          )}
        </div>

        {/* Features */}
        <div className="bg-[#1a1f2e] border border-cyan-900/30 rounded p-3">
          <h3 className="text-xs font-semibold text-cyan-100 mb-2 uppercase tracking-wide">Features</h3>
          <ul className="space-y-1 text-cyan-300/70 text-xs">
            <li>✓ Tab Management</li>
            <li>✓ Auto Updates</li>
            <li>✓ TAURIQ Integration</li>
          </ul>
        </div>

        {/* About */}
        <div className="bg-[#1a1f2e] border border-cyan-900/30 rounded p-3">
          <h3 className="text-xs font-semibold text-cyan-100 mb-1 uppercase tracking-wide">About</h3>
          <p className="text-cyan-300/70 text-xs">
            Built with Tauri + React. Part of TAURIQ ecosystem.
          </p>
          <p className="text-cyan-400/50 text-xs mt-2">v0.1.0</p>
        </div>
      </div>
    </div>
  )
}
