import type { SemanticGraphSnapshot } from '../../memory/semantic/semanticGraphEngine'
import { buildContextualFileGraph } from './contextualFileGraph'
import { runProjectUnderstanding } from './projectUnderstandingRuntime'
import { runLiveKnowledgeIndexer } from './liveKnowledgeIndexer'

export function runSemanticFilesystem(input: {
  files: string[]
  semanticGraph: SemanticGraphSnapshot
}) {
  const fileGraph = buildContextualFileGraph(input.files)
  const project = runProjectUnderstanding(input.files)
  const liveIndex = runLiveKnowledgeIndexer(input.semanticGraph, project.index.filesIndexed)

  return {
    fileGraph,
    project,
    liveIndex,
  }
}
