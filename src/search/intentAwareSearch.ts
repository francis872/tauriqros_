export function inferSearchIntent(query: string): 'workflow' | 'file' | 'memory' | 'runtime' | 'general' {
  const normalized = query.toLowerCase()

  if (/(workflow|task|plan|resume)/.test(normalized)) {
    return 'workflow'
  }

  if (/(file|folder|project|index)/.test(normalized)) {
    return 'file'
  }

  if (/(memory|recall|history|continuity)/.test(normalized)) {
    return 'memory'
  }

  if (/(runtime|anomaly|agent|mesh|health)/.test(normalized)) {
    return 'runtime'
  }

  return 'general'
}
