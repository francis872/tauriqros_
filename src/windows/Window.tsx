import { useEffect, useRef, useState } from 'react'
import { motion, useDragControls, AnimatePresence } from 'framer-motion'
import { X, Minus, Square, Maximize2 } from 'lucide-react'
import { cn } from '../utils/cn'
import { useDesktopStore, type AppWindow } from '../store/desktopStore'
import SnapLayoutPicker, { type SnapLayoutId } from './SnapLayoutPicker'

interface WindowProps {
  win: AppWindow
  children: React.ReactNode
}

export default function Window({ win, children }: WindowProps) {
  const {
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
    snapWindow,
    arrangeSnapLayout,
  } = useDesktopStore()
  const dragControls = useDragControls()
  const isFocused = useDesktopStore((state) => state.focusedWindowId === win.id)
  const containerRef = useRef<HTMLDivElement>(null)
  const [snapPreview, setSnapPreview] = useState<AppWindow['snap']>('none')
  const [showSnapPicker, setShowSnapPicker] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleMouseDown = () => focusWindow(win.id)
    el.addEventListener('mousedown', handleMouseDown, { passive: true })
    return () => el.removeEventListener('mousedown', handleMouseDown)
  }, [win.id, focusWindow])

  const isMax = win.maximized

  const startResize = (
    event: React.PointerEvent<HTMLDivElement>,
    direction: 'e' | 's' | 'w' | 'n' | 'se' | 'sw' | 'ne' | 'nw',
  ) => {
    event.stopPropagation()
    if (isMax) {
      return
    }

    focusWindow(win.id)

    const startX = event.clientX
    const startY = event.clientY
    const startWidth = win.width
    const startHeight = win.height
    const startWindowX = win.x
    const startWindowY = win.y

    const onMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      let nextX = startWindowX
      let nextY = startWindowY
      let nextWidth = startWidth
      let nextHeight = startHeight

      if (direction.includes('e')) {
        nextWidth = startWidth + deltaX
      }

      if (direction.includes('s')) {
        nextHeight = startHeight + deltaY
      }

      if (direction.includes('w')) {
        nextWidth = startWidth - deltaX
        nextX = startWindowX + deltaX
      }

      if (direction.includes('n')) {
        nextHeight = startHeight - deltaY
        nextY = startWindowY + deltaY
      }

      resizeWindow(win.id, nextWidth, nextHeight, nextX, nextY)
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        key={win.id}
        initial={{ opacity: 0, scale: 0.9, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        drag={!isMax}
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        onDrag={(_, info) => {
          if (isMax) {
            setSnapPreview('none')
            return
          }

          if (info.point.y <= 28) {
            setSnapPreview('top')
            return
          }

          if (info.point.x <= 40) {
            setSnapPreview('left')
            return
          }

          if (info.point.x >= window.innerWidth - 40) {
            setSnapPreview('right')
            return
          }

          setSnapPreview('none')
        }}
        onDragEnd={(_, info) => {
          setSnapPreview('none')
          if (!isMax) {
            if (info.point.y <= 28) {
              snapWindow(win.id, 'top')
              return
            }

            if (info.point.x <= 40) {
              snapWindow(win.id, 'left')
              return
            }

            if (info.point.x >= window.innerWidth - 40) {
              snapWindow(win.id, 'right')
              return
            }

            moveWindow(win.id, win.x + info.offset.x, win.y + info.offset.y)
          }
        }}
        style={{
          position: 'absolute',
          left: isMax ? 0 : win.x,
          top: isMax ? 0 : win.y,
          width: isMax ? '100%' : win.width,
          height: isMax ? '100%' : win.height,
          zIndex: win.zIndex,
        }}
        className={cn(
          'flex flex-col rounded-2xl overflow-hidden',
          'border transition-all duration-200',
          isFocused
            ? 'border-cyan-200/25 shadow-[0_28px_72px_rgba(0,0,0,0.75),0_0_0_1px_rgba(6,182,212,0.22),0_0_30px_rgba(34,211,238,0.14)]'
            : 'border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
          isMax ? 'rounded-none' : ''
        )}
      >
        <div className="absolute inset-0 bg-[#0d0d14]/90 backdrop-blur-2xl -z-10" />

        <div
          onPointerDown={e => { if (!isMax) dragControls.start(e) }}
          className={cn(
            'h-10 flex items-center px-3 gap-3 select-none shrink-0',
            'border-b border-white/[0.06]',
            !isMax && 'cursor-grab active:cursor-grabbing',
          )}
        >
          <div className="flex items-center gap-1.5">
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => closeWindow(win.id)}
              title="Close window"
              className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-400 transition-colors flex items-center justify-center group"
            >
              <X size={6} className="opacity-0 group-hover:opacity-100 text-red-900" />
            </button>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => minimizeWindow(win.id)}
              title="Minimize window"
              className="w-3 h-3 rounded-full bg-amber-500/70 hover:bg-amber-400 transition-colors flex items-center justify-center group"
            >
              <Minus size={6} className="opacity-0 group-hover:opacity-100 text-amber-900" />
            </button>
            {/* Green maximize button — hover shows snap layout picker */}
            <div
              className="relative"
              onMouseEnter={() => { if (!isMax) setShowSnapPicker(true) }}
              onMouseLeave={() => setShowSnapPicker(false)}
            >
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => { setShowSnapPicker(false); maximizeWindow(win.id) }}
                title={isMax ? 'Restore window' : 'Maximize / Snap layout'}
                className="w-3 h-3 rounded-full bg-green-500/70 hover:bg-green-400 transition-colors flex items-center justify-center group"
              >
                {isMax
                  ? <Square size={6} className="opacity-0 group-hover:opacity-100 text-green-900" />
                  : <Maximize2 size={6} className="opacity-0 group-hover:opacity-100 text-green-900" />
                }
              </button>
              <AnimatePresence>
                {showSnapPicker && (
                  <SnapLayoutPicker
                    onSelect={(layoutId: SnapLayoutId) => {
                      setShowSnapPicker(false)
                      arrangeSnapLayout(win.id, layoutId)
                    }}
                    onClose={() => setShowSnapPicker(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          <span className="flex-1 truncate text-center font-mono text-xs tracking-wide text-slate-400">
            {win.title}
          </span>

          <div className="w-12" />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>

        {!isMax && (
          <>
            <div
              onPointerDown={(event) => startResize(event, 'e')}
              className="absolute right-0 top-3 h-[calc(100%-24px)] w-1.5 cursor-e-resize"
            />
            <div
              onPointerDown={(event) => startResize(event, 'w')}
              className="absolute left-0 top-3 h-[calc(100%-24px)] w-1.5 cursor-w-resize"
            />
            <div
              onPointerDown={(event) => startResize(event, 's')}
              className="absolute bottom-0 left-3 h-1.5 w-[calc(100%-24px)] cursor-s-resize"
            />
            <div
              onPointerDown={(event) => startResize(event, 'n')}
              className="absolute left-3 top-0 h-1.5 w-[calc(100%-24px)] cursor-n-resize"
            />
            <div
              onPointerDown={(event) => startResize(event, 'se')}
              className="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize"
            />
            <div
              onPointerDown={(event) => startResize(event, 'sw')}
              className="absolute bottom-0 left-0 h-3 w-3 cursor-sw-resize"
            />
            <div
              onPointerDown={(event) => startResize(event, 'ne')}
              className="absolute right-0 top-0 h-3 w-3 cursor-ne-resize"
            />
            <div
              onPointerDown={(event) => startResize(event, 'nw')}
              className="absolute left-0 top-0 h-3 w-3 cursor-nw-resize"
            />
          </>
        )}
      </motion.div>

      {snapPreview !== 'none' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'pointer-events-none fixed z-[999] border border-cyan-300/40 bg-cyan-300/10 backdrop-blur-sm',
            snapPreview === 'left' && 'inset-y-0 left-0 w-1/2',
            snapPreview === 'right' && 'inset-y-0 right-0 w-1/2',
            snapPreview === 'top' && 'inset-0',
          )}
        />
      )}
    </AnimatePresence>
  )
}
