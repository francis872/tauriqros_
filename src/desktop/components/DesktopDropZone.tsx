import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, FileText, Copy, Pin, Trash2 } from 'lucide-react'

export interface DesktopItem {
  id: string
  name: string
  type: 'folder' | 'file'
  x: number
  y: number
  pinned: boolean
  createdAt: number
}

interface DesktopDropZoneProps {
  items: DesktopItem[]
  onAddItem: (item: DesktopItem) => void
  onRemoveItem: (id: string) => void
  onMoveItem: (id: string, x: number, y: number) => void
  onPinItem: (id: string) => void
}

export default function DesktopDropZone({
  items,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onPinItem,
}: DesktopDropZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const isFolder = file.type === ''

          onAddItem({
            id: `item-${Date.now()}-${i}`,
            name: file.name.split('.')[0],
            type: isFolder ? 'folder' : 'file',
            x: Math.max(0, Math.min(x + i * 10, rect.width - 80)),
            y: Math.max(0, Math.min(y + i * 10, rect.height - 80)),
            pinned: false,
            createdAt: Date.now(),
          })
        }
      }
    },
    [onAddItem]
  )

  const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItemId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleItemDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>, id: string) => {
      setDraggedItemId(null)

      const rect = (e.target as HTMLElement).parentElement?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (x > 0 && y > 0 && x < rect.width && y < rect.height) {
          onMoveItem(id, x, y)
        }
      }
    },
    [onMoveItem]
  )

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ id, x: e.clientX, y: e.clientY })
    setSelectedId(id)
  }

  const pinnedItems = items.filter((item) => item.pinned)
  const unpinnedItems = items.filter((item) => !item.pinned)

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        setContextMenu(null)
        setSelectedId(null)
      }}
      className={`absolute inset-0 transition-colors duration-200 ${
        isDraggingOver ? 'bg-cyan-300/5' : 'bg-transparent'
      }`}
    >
      {/* Pinned items - Grid layout at top */}
      {pinnedItems.length > 0 && (
        <div className="pointer-events-none absolute left-6 top-20 flex flex-wrap gap-6 max-w-xs">
          {pinnedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="pointer-events-auto flex flex-col items-center cursor-pointer group"
              onContextMenu={(e) => handleContextMenu(e, item.id)}
              onClick={() => setSelectedId(item.id)}
            >
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-lg border transition-all ${
                  selectedId === item.id
                    ? 'border-cyan-300/60 bg-cyan-300/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : 'border-cyan-300/20 bg-cyan-300/10 group-hover:border-cyan-300/40 group-hover:bg-cyan-300/15'
                }`}
              >
                {item.type === 'folder' ? (
                  <Folder size={28} className="text-cyan-300" />
                ) : (
                  <FileText size={28} className="text-blue-300" />
                )}
              </div>
              <p className="mt-2 text-xs text-cyan-100/80 text-center max-w-[70px] truncate">
                {item.name}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Unpinned items - Free placement */}
      <AnimatePresence>
        {unpinnedItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            drag
            dragMomentum={false}
            onDragStart={(e) => handleItemDragStart(e as any, item.id)}
            onDragEnd={(e) => handleItemDragEnd(e as any, item.id)}
            style={{
              position: 'absolute',
              left: `${item.x}px`,
              top: `${item.y}px`,
              cursor: draggedItemId === item.id ? 'grabbing' : 'grab',
            }}
            className="pointer-events-auto flex flex-col items-center group"
            onContextMenu={(e) => handleContextMenu(e, item.id)}
            onClick={() => setSelectedId(item.id)}
          >
            <div
              className={`flex items-center justify-center w-16 h-16 rounded-lg border transition-all ${
                selectedId === item.id
                  ? 'border-cyan-300/60 bg-cyan-300/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                  : 'border-cyan-300/20 bg-cyan-300/10 group-hover:border-cyan-300/40 group-hover:bg-cyan-300/15'
              }`}
            >
              {item.type === 'folder' ? (
                <Folder size={32} className="text-cyan-300" />
              ) : (
                <FileText size={32} className="text-blue-300" />
              )}
            </div>
            <p className="mt-2 text-xs text-cyan-100/80 text-center max-w-[80px] truncate">
              {item.name}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            className="pointer-events-auto z-50 w-48 overflow-hidden rounded-lg border border-cyan-300/30 bg-[#0a1018]/95 shadow-2xl backdrop-blur-xl"
          >
            <button
              onClick={() => {
                if (contextMenu) onPinItem(contextMenu.id)
                setContextMenu(null)
              }}
              className="w-full px-3 py-2 text-left text-sm text-cyan-100 hover:bg-cyan-300/10 transition-colors flex items-center gap-2 border-b border-cyan-300/10"
            >
              <Pin size={14} /> Pin to Desktop
            </button>
            <button
              onClick={() => {
                if (contextMenu) {
                  const item = items.find((i) => i.id === contextMenu.id)
                  if (item) {
                    navigator.clipboard.writeText(item.name)
                  }
                }
                setContextMenu(null)
              }}
              className="w-full px-3 py-2 text-left text-sm text-cyan-100 hover:bg-cyan-300/10 transition-colors flex items-center gap-2 border-b border-cyan-300/10"
            >
              <Copy size={14} /> Copy
            </button>
            <button
              onClick={() => {
                if (contextMenu) onRemoveItem(contextMenu.id)
                setContextMenu(null)
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-300/10 transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
              Drop folders & files here
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
