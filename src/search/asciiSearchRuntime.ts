import { APP_REGISTRY } from '../apps/registry'
import type { IndexedFileRecord } from '../indexing/fileIndexingService'

export interface AsciiSearchResult {
  id: string
  label: string
  description: string
  route: string
  category: string
  score: number
  type: 'app' | 'file'
  filePath?: string
}

export interface AsciiSearchSnapshot {
  query: string
  timestamp: number
  results: AsciiSearchResult[]
  asciiFrame: string
}

function normalize(text: string) {
  return text.trim().toLowerCase()
}

function tokenScore(query: string, source: string) {
  const queryTokens = query.split(/\s+/).filter(Boolean)
  if (queryTokens.length === 0) return 0

  const sourceTokens = source.split(/\s+/).filter(Boolean)
  let score = 0
  let hits = 0

  for (const token of queryTokens) {
    if (source === token) {
      score += 1
      hits += 1
    } else if (source.startsWith(token)) {
      score += 0.82
      hits += 1
    } else if (source.includes(token)) {
      score += 0.62
      hits += 1
    } else {
      const initials = sourceTokens.map((word) => word[0]).join('')
      if (initials.includes(token[0])) {
        score += 0.18
      }
    }
  }

  return score * (hits / queryTokens.length)
}

function scoreApp(query: string, app: typeof APP_REGISTRY[string], index: number) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) {
    return 1 - index * 0.03
  }

  const label = normalize(app.label)
  const description = normalize(app.description)
  const route = normalize(app.route)
  const category = normalize(app.category)

  const labelScore = tokenScore(normalizedQuery, label)
  const routeScore = tokenScore(normalizedQuery, route) * 0.8
  const descriptionScore = tokenScore(normalizedQuery, description) * 0.55
  const categoryScore = tokenScore(normalizedQuery, category) * 0.4

  return Math.min(
    labelScore * 5 + routeScore * 3 + descriptionScore * 2 + categoryScore,
    5,
  )
}

function scoreFile(query: string, record: IndexedFileRecord) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) {
    return 0
  }

  const nameScore = tokenScore(normalizedQuery, normalize(record.name))
  const pathScore = tokenScore(normalizedQuery, normalize(record.path)) * 0.85
  const tagScore = record.tags
    .map((tag) => tokenScore(normalizedQuery, normalize(tag)))
    .reduce((sum, value) => sum + value, 0) * 0.25

  return Math.min(nameScore * 3 + pathScore * 2 + tagScore, 5)
}

function pad(text: string, width: number) {
  return text.length > width ? text.slice(0, width - 1) + '…' : text.padEnd(width, ' ')
}

export function runAsciiSearch(
  query: string,
  extraFileRecords: IndexedFileRecord[] = [],
): AsciiSearchSnapshot {
  const normalized = query.trim()
  const appResults = Object.values(APP_REGISTRY)
    .map((app, index) => ({
      id: app.id,
      label: app.label,
      description: app.description,
      route: app.route,
      category: app.category,
      score: scoreApp(normalized, app, index),
      type: 'app' as const,
    }))
    .filter((item) => normalized ? item.score > 0.5 : item.score > 0)

  const fileResults = normalized && extraFileRecords.length > 0
    ? extraFileRecords
        .map((record, index) => ({
          id: `dare-file-${index}`,
          label: record.name,
          description: record.path,
          route: record.path,
          category: record.kind === 'directory' ? 'DARE folder' : 'DARE file',
          score: scoreFile(normalized, record),
          type: 'file' as const,
          filePath: record.path,
        }))
        .filter((item) => item.score > 0.4)
    : []

  const results = [...appResults, ...fileResults]
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, 12)

  const asciiLines = [
    '╔════════════════════════════════════════════════════════════════════════╗',
    `║  TAURIQ ASCII SEARCH — consulta: ${pad(normalized || '...' , 48)} ║`,
    '╠════════════════════════════════════════════════════════════════════════╣',
  ]

  if (results.length === 0) {
    asciiLines.push('║  No se encontraron resultados. Intenta otra palabra clave.           ║')
  } else {
    asciiLines.push(`║  ${pad(`Resultados ${results.length}`, 70)}║`)
    asciiLines.push('╠────────────────────────────────────────────────────────────────────────╣')
    results.forEach((item, index) => {
      asciiLines.push(`║ ${String(index + 1).padEnd(2)} ${pad(item.label, 30)} ${pad(item.category, 12)} ${pad(item.route, 20)}║`)
      asciiLines.push(`║    ${pad(item.description, 66)}║`)
      asciiLines.push('╟────────────────────────────────────────────────────────────────────────╢')
    })
    asciiLines.pop()
  }

  asciiLines.push('╚════════════════════════════════════════════════════════════════════════╝')

  return {
    query: normalized,
    timestamp: Date.now(),
    results,
    asciiFrame: asciiLines.join('\n'),
  }
}
