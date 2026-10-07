import { chunkSemanticText } from './semanticChunkRuntime'
import { generateEmbedding } from './embeddingRuntime'

export async function runRagPipeline(input: {
  query: string
  corpus: string
  modelId: string
}) {
  const chunks = chunkSemanticText(input.corpus)
  const embeddings = await Promise.all(
    chunks.slice(0, 8).map(async (chunk) => ({
      chunk,
      embedding: await generateEmbedding({ text: chunk.content, modelId: input.modelId }),
    })),
  )

  const best = embeddings[0]

  return {
    chunks: chunks.length,
    embedded: embeddings.length,
    retrievedContext: best?.chunk.content.slice(0, 220) ?? input.corpus.slice(0, 220),
    responseSeed: `RAG context stitched for query: ${input.query}`,
  }
}
