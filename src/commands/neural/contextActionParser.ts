/**
 * Context Action Parser — Phase 11
 * Parses natural language commands into structured action intents,
 * extracting targets, parameters, and confidence scores.
 */

import { findCommandByText, type CommandNode } from './runtimeCommandGraph'

export interface ParsedAction {
  commandNode: CommandNode | null
  rawText: string
  extractedTarget?: string
  extractedParam?: string
  confidence: number
  isRecognized: boolean
  parseNotes: string
}

const TARGET_PATTERNS: Array<{ pattern: RegExp; extract: (m: RegExpMatchArray) => string }> = [
  { pattern: /workspace[s]?\s+["']?(\w[\w\s-]*\w)["']?/i, extract: (m) => m[1] },
  { pattern: /open\s+["']?(\w[\w\s-]*\w)["']?/i, extract: (m) => m[1] },
  { pattern: /switch\s+to\s+["']?(\w[\w\s-]*\w)["']?/i, extract: (m) => m[1] },
  { pattern: /resume\s+["']?(\w[\w\s-]*\w)["']?/i, extract: (m) => m[1] },
]

export function parseContextAction(rawText: string): ParsedAction {
  const commandNode = findCommandByText(rawText)

  let extractedTarget: string | undefined
  for (const { pattern, extract } of TARGET_PATTERNS) {
    const m = rawText.match(pattern)
    if (m) {
      extractedTarget = extract(m).trim()
      break
    }
  }

  const isRecognized = commandNode !== null
  const confidence = isRecognized
    ? 0.75 + (extractedTarget ? 0.15 : 0)
    : 0.2

  return {
    commandNode,
    rawText,
    extractedTarget,
    confidence: Number(confidence.toFixed(2)),
    isRecognized,
    parseNotes: isRecognized
      ? `Matched command: ${commandNode!.id}`
      : 'No matching command found — routing to system LLM for interpretation',
  }
}
