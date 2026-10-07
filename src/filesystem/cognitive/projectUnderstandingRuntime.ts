import { buildIntelligentProjectIndex } from './intelligentProjectIndexer'

export function runProjectUnderstanding(paths: string[]) {
  const index = buildIntelligentProjectIndex(paths)
  const dominantExtension = Object.entries(index.byExtension)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'ts'

  return {
    index,
    dominantExtension,
    summary: `Indexed ${index.filesIndexed} files. Dominant extension ${dominantExtension}.`,
  }
}
