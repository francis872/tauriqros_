import { motion } from 'framer-motion'
import { containerVariants, fadeInUp } from '../animations/variants'
import SettingsApp from '../apps/SettingsApp'

export default function SettingsView() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col"
    >
      <motion.div variants={fadeInUp} className="px-6 pt-6 pb-4 shrink-0">
        <h1 className="text-xl font-semibold text-slate-200">Settings</h1>
        <p className="text-xs text-slate-600 mt-0.5 font-mono">system configuration</p>
      </motion.div>
      <motion.div variants={fadeInUp} className="flex-1 min-h-0 mx-6 mb-6 widget-card overflow-hidden">
        <SettingsApp windowId="settings-view" />
      </motion.div>
    </motion.div>
  )
}
