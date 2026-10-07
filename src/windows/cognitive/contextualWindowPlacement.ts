/**
 * Contextual Window Placement — Phase 11
 * Suggests optimal window positions based on app type, cognitive context,
 * and screen real estate constraints.
 */

export interface WindowPlacementSuggestion {
  appId: string
  suggestedX: number
  suggestedY: number
  suggestedWidth: number
  suggestedHeight: number
  layoutSlot: number
  reasoning: string
}

export interface WindowPlacementPlan {
  suggestions: WindowPlacementSuggestion[]
  viewportWidth: number
  viewportHeight: number
  placementStrategy: 'grid' | 'focus-primary' | 'equal-split' | 'overlay'
}

export function planWindowPlacements(input: {
  openAppIds: string[]
  focusedAppId: string
  viewportWidth: number
  viewportHeight: number
}): WindowPlacementPlan {
  const { openAppIds, focusedAppId, viewportWidth, viewportHeight } = input
  const taskbarH = 48
  const usableH = viewportHeight - taskbarH

  if (openAppIds.length === 0) {
    return {
      suggestions: [],
      viewportWidth,
      viewportHeight,
      placementStrategy: 'equal-split',
    }
  }

  if (openAppIds.length === 1) {
    return {
      suggestions: [{
        appId: openAppIds[0],
        suggestedX: 0,
        suggestedY: 0,
        suggestedWidth: viewportWidth,
        suggestedHeight: usableH,
        layoutSlot: 0,
        reasoning: 'Single app — full viewport',
      }],
      viewportWidth,
      viewportHeight,
      placementStrategy: 'focus-primary',
    }
  }

  // Focus app gets 60% width, others share remaining 40%
  const focusW = Math.floor(viewportWidth * 0.6)
  const sideW = viewportWidth - focusW
  const sideH = Math.floor(usableH / Math.max(1, openAppIds.length - 1))

  const suggestions: WindowPlacementSuggestion[] = []
  const sideApps = openAppIds.filter((id) => id !== focusedAppId)

  suggestions.push({
    appId: focusedAppId,
    suggestedX: 0,
    suggestedY: 0,
    suggestedWidth: focusW,
    suggestedHeight: usableH,
    layoutSlot: 0,
    reasoning: 'Focus app — primary slot (60% width)',
  })

  sideApps.forEach((appId, i) => {
    suggestions.push({
      appId,
      suggestedX: focusW,
      suggestedY: i * sideH,
      suggestedWidth: sideW,
      suggestedHeight: sideH,
      layoutSlot: i + 1,
      reasoning: `Side panel slot ${i + 1}`,
    })
  })

  return {
    suggestions,
    viewportWidth,
    viewportHeight,
    placementStrategy: 'focus-primary',
  }
}
