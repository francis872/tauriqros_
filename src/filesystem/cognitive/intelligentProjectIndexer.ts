export function buildIntelligentProjectIndex(paths: string[]) {
  const byExtension = paths.reduce<Record<string, number>>((acc, path) => {
    const extension = path.split('.').pop() ?? 'unknown'
    acc[extension] = (acc[extension] ?? 0) + 1
    return acc
  }, {})

  return {
    filesIndexed: paths.length,
    byExtension,
  }
}
