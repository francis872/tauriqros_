import type { IndexedFileRecord } from '../indexing/fileIndexingService'

export interface FilesystemContextSuggestion {
  title: string
  rationale: string
}

export function buildFilesystemSuggestions(index: IndexedFileRecord[]): FilesystemContextSuggestion[] {
  const projectHits = index.filter((entry) => entry.tags.includes('project')).slice(0, 2)
  const codeHits = index.filter((entry) => entry.tags.includes('code')).slice(0, 2)

  const suggestions: FilesystemContextSuggestion[] = []

  projectHits.forEach((entry) => {
    suggestions.push({
      title: `Resume project: ${entry.name}`,
      rationale: `Frequently accessed workspace artifact at ${entry.path}.`,
    })
  })

  codeHits.forEach((entry) => {
    suggestions.push({
      title: `Open source file: ${entry.name}`,
      rationale: 'Detected as high-signal code context for current workspace.',
    })
  })

  return suggestions.slice(0, 4)
}
