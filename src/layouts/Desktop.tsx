import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

const VIEW_LABELS: Record<string, string> = {
	home: 'Home',
	ai: 'AI',
	files: 'Files',
	terminal: 'Terminal',
	settings: 'Settings',
}

function StatusPanel({ label, value }: { label: string; value: string }) {
	return (
		<div className="glass rounded-2xl border border-cyan-200/10 p-4">
			<p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-mono">{label}</p>
			<p className="mt-2 text-cyan-100 text-xl font-semibold">{value}</p>
		</div>
	)
}

export default function Desktop() {
	const [activeView, setActiveView] = useState('home')

	const viewTitle = useMemo(() => VIEW_LABELS[activeView] ?? 'Home', [activeView])

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.985 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
			className="relative w-full h-full overflow-hidden bg-[#05070b]"
		>
			<div className="absolute inset-0 bg-[radial-gradient(65%_60%_at_85%_15%,rgba(34,211,238,0.22),transparent_62%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_12%_80%,rgba(14,165,233,0.12),transparent_65%)]" />
			<div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.015),transparent_40%,rgba(255,255,255,0.02)_80%)]" />
			<div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:34px_34px] opacity-25" />
			<motion.div
				animate={{ opacity: [0.25, 0.45, 0.25] }}
				transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
				className="absolute -top-16 right-14 w-80 h-80 rounded-full bg-cyan-400/20 blur-[120px]"
			/>

			<div className="relative z-10 w-full h-full p-4 md:p-6">
				<div className="w-full h-full glass-panel rounded-[22px] border border-cyan-200/15 overflow-hidden shadow-[0_10px_60px_rgba(0,0,0,0.45)]">
					<div className="w-full h-full flex">
						<Sidebar activeView={activeView} onViewChange={setActiveView} />

						<div className="flex-1 min-w-0 flex flex-col">
							<TopBar />

							<main className="flex-1 p-5 md:p-7 overflow-auto no-scrollbar">
								<motion.div
									key={activeView}
									initial={{ opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.35 }}
									className="space-y-5"
								>
									<section className="glass rounded-3xl border border-cyan-200/10 p-6 md:p-8">
										<p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/70 font-mono">TAURIQ Interface</p>
										<h2 className="mt-2 text-2xl md:text-4xl font-semibold text-cyan-50">{viewTitle} Workspace</h2>
										<p className="mt-3 text-slate-300 max-w-2xl">
											Premium desktop shell with cinematic boot entry, ambient cyan glow, and glassmorphism composition.
										</p>
									</section>

									<section className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<StatusPanel label="System Health" value="Optimal" />
										<StatusPanel label="Neural Link" value="Stable" />
										<StatusPanel label="Desktop Mode" value="Futuristic" />
									</section>
								</motion.div>
							</main>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	)
}

