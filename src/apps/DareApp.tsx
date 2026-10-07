import { useEffect, useMemo, useState } from 'react'
import { useDesktopStore } from '../store/desktopStore'
import { DARE_BUILD_ROUTE, DARE_WORKSPACE_PATH } from './dareWorkspace'

export default function DareApp() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const store = useDesktopStore()
  const src = useMemo(() => DARE_BUILD_ROUTE, [])

  useEffect(() => {
    let mounted = true

    fetch(DARE_BUILD_ROUTE, { method: 'GET' })
      .then(async (res) => {
        if (!mounted) return
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const text = await res.text()
        if (text.includes('/@vite/client') || /TAURIQ/i.test(text)) {
          throw new Error('La ruta /dare/ devuelve la página principal de TAURIQ en lugar del build de DARE.')
        }
        if (text.includes('<!doctype html>')) {
          setStatus('ready')
          return
        }
        throw new Error('Contenido inesperado al cargar DARE.')
      })
      .catch((err) => {
        if (!mounted) return
        setStatus('error')
        setMessage(err.message)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="border-b border-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-100 bg-slate-950/90">
        DARE Workspace
      </div>

      {status === 'loading' && (
        <div className="flex h-full items-center justify-center px-6 text-center text-slate-300">
          <div>
            <p className="text-lg font-semibold">Cargando DARE...</p>
            <p className="mt-2 text-sm text-slate-500">Verificando si el build de DARE está disponible.</p>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <iframe
          title="DARE Workspace"
          src={src}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      )}

      {status === 'error' && (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-slate-200">
          <div className="max-w-xl rounded-3xl border border-white/[0.08] bg-slate-900/90 p-8 shadow-lg shadow-black/20">
            <p className="text-lg font-semibold text-slate-100">No se pudo cargar la aplicación DARE</p>
            <p className="mt-2 text-sm text-slate-400">{message ?? 'El build de DARE no está disponible localmente.'}</p>
            <p className="mt-3 text-sm text-slate-500">Mientras tanto, puedes abrir el workspace DARE en el explorador de archivos integrado.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => store.openApp('files', 'Files', 780, 520, DARE_WORKSPACE_PATH)}
                className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Abrir carpeta DARE
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
              >
                Reintentar carga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
