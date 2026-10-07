export function retrieveTemporalKnowledge(input: Array<{ id: string; updatedAt: number; label: string }>) {
  return [...input]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      label: item.label,
      ageSeconds: Math.max(1, Math.floor((Date.now() - item.updatedAt) / 1000)),
    }))
}
