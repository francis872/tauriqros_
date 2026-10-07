import type { IndexedFileRecord } from './fileIndexingService'

export interface ProjectDescriptor {
  id: string
  name: string
  path: string
  confidence: number
  type: 'development' | 'ai' | 'research' | 'general'
}

export function detectProjects(records: IndexedFileRecord[]): ProjectDescriptor[] {
  return records
    .filter((record) => record.kind === 'directory')
    .map((record, index) => {
      let type: ProjectDescriptor['type'] = 'general'
      if (record.tags.includes('development')) {
        type = 'development'
      }
      if (record.tags.includes('ai')) {
        type = 'ai'
      }
      if (record.tags.includes('planning')) {
        type = 'research'
      }

      return {
        id: `${record.id}-project`,
        name: record.name,
        path: record.path,
        confidence: Math.max(40, 95 - index * 8),
        type,
      }
    })
    .slice(0, 8)
}
