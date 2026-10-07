/**
 * TAURIQ Snap Layout Picker — Phase 10
 * Floating panel shown on maximize-button hover.
 * Renders SVG miniatures for base, extended, and cognitive layouts.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'
import {
  getAvailableLayouts,
  LAYOUT_TEMPLATES,
  type SnapLayoutId,
  type SnapLayoutTemplate,
} from './layoutTemplates'

// Re-export so desktopStore and Window.tsx don't need to change imports
export type { SnapLayoutId }
export { LAYOUT_TEMPLATES as SNAP_LAYOUT_DEFS }

// ─── SVG layout diagram ───────────────────────────────────────────────────────

function LayoutDiagram({
  template,
  hovered,
}: {
  template: SnapLayoutTemplate
  hovered: boolean
}) {
  const W = 44
  const H = 32
  const GAP = 1.5

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      {template.slots.map((slot, i) => {
        const x = slot.x * (W - GAP * 2) + GAP
        const y = slot.y * (H - GAP * 2) + GAP
        const w = slot.w * (W - GAP * 2) - GAP
        const h = slot.h * (H - GAP * 2) - GAP

        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={2}
            className="transition-all duration-100"
            fill={
              hovered && i === 0
                ? 'rgba(34,211,238,0.75)'
                : hovered
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(255,255,255,0.07)'
            }
            stroke={
              hovered && i === 0
                ? 'rgba(103,232,249,0.5)'
                : 'rgba(255,255,255,0.06)'
            }
            strokeWidth={0.75}
          />
        )
      })}
    </svg>
  )
}

// ─── Individual layout button ─────────────────────────────────────────────────

function LayoutButton({
  template,
  onSelect,
}: {
  template: SnapLayoutTemplate
  onSelect: (id: SnapLayoutId) => void
}) {
  const [hovered, setHovered] = useState(false)

  const tierColor: Record<SnapLayoutTemplate['tier'], string> = {
    base:      '',
    extended:  'text-sky-600',
    cognitive: 'text-cyan-500',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(template.id)}
      title={template.description}
      className={cn(
        'group flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5',
        'hover:bg-white/[0.06] transition-colors',
      )}
    >
      <LayoutDiagram template={template} hovered={hovered} />
      <span
        className={cn(
          'text-[8px] font-mono select-none transition-colors',
          hovered ? 'text-slate-300' : 'text-slate-600',
          tierColor[template.tier],
        )}
      >
        {template.label}
      </span>
    </motion.button>
  )
}

// ─── Tier section label ───────────────────────────────────────────────────────

function TierHeader({ label, color }: { label: string; color: string }) {
  return (
    <p className={cn('px-1 pt-1 pb-0.5 text-[8px] font-mono tracking-widest uppercase select-none', color)}>
      {label}
    </p>
  )
}

// ─── Main picker ──────────────────────────────────────────────────────────────

interface SnapLayoutPickerProps {
  onSelect: (layoutId: SnapLayoutId) => void
  onClose: () => void
}

export default function SnapLayoutPicker({ onSelect, onClose }: SnapLayoutPickerProps) {
  const available = getAvailableLayouts(window.innerWidth)
  const base      = available.filter((t) => t.tier === 'base')
  const extended  = available.filter((t) => t.tier === 'extended')
  const cognitive = available.filter((t) => t.tier === 'cognitive')

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.94 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      onMouseLeave={onClose}
      className={cn(
        'absolute top-full left-0 mt-1 z-[9999]',
        'rounded-xl border border-white/[0.09] bg-black/85 backdrop-blur-2xl shadow-2xl shadow-black/70',
        'p-2 min-w-[148px]',
      )}
    >
      {base.length > 0 && (
        <>
          <TierHeader label="Layout" color="text-slate-600" />
          <div className="grid grid-cols-3 gap-0.5">
            {base.map((t) => <LayoutButton key={t.id} template={t} onSelect={onSelect} />)}
          </div>
        </>
      )}

      {extended.length > 0 && (
        <>
          <div className="my-1 border-t border-white/[0.05]" />
          <TierHeader label="Extended" color="text-sky-700" />
          <div className="grid grid-cols-3 gap-0.5">
            {extended.map((t) => <LayoutButton key={t.id} template={t} onSelect={onSelect} />)}
          </div>
        </>
      )}

      {cognitive.length > 0 && (
        <>
          <div className="my-1 border-t border-white/[0.05]" />
          <TierHeader label="Cognitive" color="text-cyan-700" />
          <div className="grid grid-cols-3 gap-0.5">
            {cognitive.map((t) => <LayoutButton key={t.id} template={t} onSelect={onSelect} />)}
          </div>
        </>
      )}
    </motion.div>
  )
}

