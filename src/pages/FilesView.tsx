import { motion } from 'framer-motion'
import { FolderOpen, HardDrive } from 'lucide-react'
import { containerVariants, fadeInUp } from '../animations/variants'
import { useDesktopStore } from '../store/desktopStore'
import { APP_REGISTRY } from '../apps/registry'

const PINNED = [
  { name: 'Projects', items: 3 },
  { name: 'Documents', items: 12 },
  { name: 'Downloads', items: 7 },
  { name: 'Desktop', items: 2 },
  { name: '.tauriq', items: 4 },
  { name: 'Home', items: 8 },
]

export default function FilesView() {
  const { openApp } = useDesktopStore()

  const openFiles = () =>
    openApp('files', APP_REGISTRY.files.label, APP_REGISTRY.files.defaultWidth, APP_REGISTRY.files.defaultHeight)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full overflow-y-auto p-6 no-scrollbar"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-200">Files</h1>
          <p className="text-xs text-slate-600 mt-0.5 font-mono">virtual filesystem</p>
        </div>
        <button onClick={openFiles} className="tauriq-btn-primary text-xs">
          <FolderOpen size={12} /> Open Files
        </button>
      </motion.div>

      <motion.div variants={fadeInUp} className="widget-card mb-4">
        <div className="flex items-center gap-3">
          <HardDrive size={16} className="text-sky-400" />
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">TAURIQ Virtual FS</span>
              <span className="font-mono text-slate-600">48 GB / 256 GB</span>
            </div>
            <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '19%' }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="widget-card">
        <p className="text-[10px] font-mono text-slate-600 tracking-widest mb-3">PINNED LOCATIONS</p>
        <div className="grid grid-cols-3 gap-2">
          {PINNED.map((folder, i) => (
            <motion.div
              key={folder.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={openFiles}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-all group"
            >
              <FolderOpen size={28} className="text-sky-400/50 group-hover:text-sky-400 transition-colors" />
              <span className="text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">{folder.name}</span>
              <span className="text-[9px] text-slate-700">{folder.items} items</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
