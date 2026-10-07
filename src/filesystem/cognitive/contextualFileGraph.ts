export interface FileContextNode {
  path: string
  cluster: string
  relevance: number
}

export function buildContextualFileGraph(files: string[]): FileContextNode[] {
  return files.map((path, index) => ({
    path,
    cluster: path.includes('src') ? 'source' : 'support',
    relevance: Number((0.62 + (index % 4) * 0.08).toFixed(2)),
  }))
}
