import React from 'react'

export interface WorkflowPanelProps {
  workflowName: string
  progress: number    // 0–1
  status: 'running' | 'paused' | 'recovered' | 'stalled'
}

export function WorkflowAdaptivePanel({ workflowName, progress, status }: WorkflowPanelProps) {
  const statusColor = status === 'running' ? 'text-emerald-400' :
    status === 'recovered' ? 'text-cyan-400' :
    status === 'stalled' ? 'text-red-400' :
    'text-amber-400'
  const barWidth = `${Math.round(progress * 100)}%`
  return React.createElement(
    'div',
    { className: 'rounded border border-white/10 bg-white/5 p-2' },
    React.createElement('div', { className: 'flex justify-between mb-1' },
      React.createElement('span', { className: 'text-xs text-white/70' }, workflowName),
      React.createElement('span', { className: `text-xs ${statusColor}` }, status),
    ),
    React.createElement('div', { className: 'h-1 rounded bg-white/10 overflow-hidden' },
      React.createElement('div', { className: 'h-full bg-cyan-500/60 rounded', style: { width: barWidth } }),
    ),
  )
}
