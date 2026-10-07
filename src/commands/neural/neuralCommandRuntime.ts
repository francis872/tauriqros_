/**
 * Neural Command Runtime — Phase 11
 * Main processor for natural language system commands.
 * Parses intent, routes to command graph, executes actions,
 * and returns a full observable snapshot of the command session.
 */

import { parseContextAction, type ParsedAction } from './contextActionParser'
import { executeSystemAction, type ActionExecutionResult } from './systemActionExecutor'
import { RUNTIME_COMMAND_GRAPH } from './runtimeCommandGraph'

export interface NeuralCommandSnapshot {
  availableCommands: number
  lastParsed: ParsedAction | null
  lastExecution: ActionExecutionResult | null
  commandHistory: string[]
  sessionCommandCount: number
  recognitionRate: number
  runtimeReady: boolean
}

const commandHistory: string[] = []
let sessionCommandCount = 0
let recognizedCount = 0

export function processNeuralCommand(text: string): {
  parsed: ParsedAction
  execution: ActionExecutionResult | null
} {
  commandHistory.unshift(text)
  if (commandHistory.length > 20) commandHistory.pop()
  sessionCommandCount++

  const parsed = parseContextAction(text)
  if (parsed.isRecognized) recognizedCount++

  let execution: ActionExecutionResult | null = null
  if (parsed.commandNode) {
    execution = executeSystemAction(parsed.commandNode, parsed.extractedTarget)
  }

  return { parsed, execution }
}

export function getNeuralCommandSnapshot(): NeuralCommandSnapshot {
  const recognitionRate = sessionCommandCount > 0
    ? Number((recognizedCount / sessionCommandCount).toFixed(2))
    : 0

  return {
    availableCommands: RUNTIME_COMMAND_GRAPH.length,
    lastParsed: null,
    lastExecution: null,
    commandHistory: [...commandHistory],
    sessionCommandCount,
    recognitionRate,
    runtimeReady: true,
  }
}
