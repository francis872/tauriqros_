export interface SemanticChunk {
  id: string
  content: string
  order: number
}

export function chunkSemanticText(text: string, chunkSize = 260): SemanticChunk[] {
  const chunks: SemanticChunk[] = []
  let cursor = 0
  let order = 0

  while (cursor < text.length) {
    chunks.push({
      id: `chunk-${order + 1}`,
      content: text.slice(cursor, cursor + chunkSize),
      order,
    })
    cursor += chunkSize
    order += 1
  }

  return chunks
}
