import React from 'react'

export interface ContextualPanelProps {
  label: string
  value: string
  accent?: string
}

export function ContextualUiPanel({ label, value, accent = 'text-cyan-400' }: ContextualPanelProps) {
  return React.createElement(
    'div',
    { className: 'rounded border border-white/10 bg-white/5 p-2' },
    React.createElement('div', { className: 'text-xs text-white/40 mb-1' }, label),
    React.createElement('div', { className: `text-xs font-mono ${accent}` }, value),
  )
}
