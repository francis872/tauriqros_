import React from 'react'
import type { ProactiveSuggestion } from './proactiveUiSuggestions'

interface SuggestionChipProps {
  suggestion: ProactiveSuggestion
}

function SuggestionChip({ suggestion }: SuggestionChipProps) {
  const urgencyColor = suggestion.urgency === 'high' ? 'border-amber-500/50 text-amber-400' :
    suggestion.urgency === 'normal' ? 'border-cyan-500/30 text-cyan-400' :
    'border-white/20 text-white/50'
  return React.createElement(
    'div',
    { className: `rounded border ${urgencyColor} bg-white/5 px-2 py-1 text-xs` },
    suggestion.label,
  )
}

export interface AdaptiveComposerProps {
  suggestions: ProactiveSuggestion[]
  activeWorkflowPanel: string | null
}

export function AdaptiveComponentComposer({ suggestions, activeWorkflowPanel }: AdaptiveComposerProps) {
  return React.createElement(
    'div',
    { className: 'flex flex-col gap-1' },
    activeWorkflowPanel && React.createElement('div', { className: 'text-xs text-white/40 mb-1' }, `Active panel: ${activeWorkflowPanel}`),
    ...suggestions.map((s) => React.createElement(SuggestionChip, { key: s.id, suggestion: s })),
  )
}
