import type { FilesystemEntry } from '../filesystem/filesystemService'

export interface IndexedFileRecord {
  id: string
  name: string
  path: string
  kind: FilesystemEntry['kind']
  size: number
  score: number
  tags: string[]
}

export interface FileIndexSnapshot {
  indexedAt: number
  records: IndexedFileRecord[]
}

function detectTags(path: string, name: string): string[] {
  const tags: string[] = []
  const loweredPath = path.toLowerCase()
  const loweredName = name.toLowerCase()

  if (loweredPath.includes('project') || loweredName.includes('package.json')) {
    tags.push('development')
  }

  if (loweredName.endsWith('.md') || loweredName.includes('roadmap')) {
    tags.push('planning')
  }

  if (loweredName.includes('ai') || loweredPath.includes('ai')) {
    tags.push('ai')
  }

  if (tags.length === 0) {
    tags.push('general')
  }

  return tags
}

export function createFileIndex(entries: FilesystemEntry[], basePath: string): FileIndexSnapshot {
  const records = entries.map((entry, index) => {
    const path = `${basePath === '/' ? '' : basePath}/${entry.name}`.replace(/\/+/g, '/')
    const tags = detectTags(path, entry.name)

    return {
      id: `${path}-${index}`,
      name: entry.name,
      path,
      kind: entry.kind,
      size: entry.size,
      score: Math.max(1, 100 - index * 5),
      tags,
    }
  })

  return {
    indexedAt: Date.now(),
    records,
  }
}

export function createExplicitFileIndex(entries: FilesystemEntry[]): FileIndexSnapshot {
  const records = entries.map((entry, index) => {
    const path = entry.path
    const tags = detectTags(path, entry.name)

    return {
      id: `${path}-${index}`,
      name: entry.name,
      path,
      kind: entry.kind,
      size: entry.size,
      score: Math.max(1, 100 - index * 3),
      tags,
    }
  })

  return {
    indexedAt: Date.now(),
    records,
  }
}

export function intelligentSearch(index: FileIndexSnapshot, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return index.records.slice(0, 12)
  }

  return index.records
    .filter((record) => (
      record.name.toLowerCase().includes(normalized)
      || record.path.toLowerCase().includes(normalized)
      || record.tags.some((tag) => tag.includes(normalized))
    ))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
}
