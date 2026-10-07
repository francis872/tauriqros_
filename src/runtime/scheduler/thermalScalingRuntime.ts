export function applyThermalScaling(thermalC: number) {
  if (thermalC > 80) {
    return { aiConcurrency: 1, backgroundBudget: 'minimal' as const }
  }

  if (thermalC > 68) {
    return { aiConcurrency: 2, backgroundBudget: 'reduced' as const }
  }

  return { aiConcurrency: 4, backgroundBudget: 'normal' as const }
}
