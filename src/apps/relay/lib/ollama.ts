/**
 * Ollama API utility for RELAY agents.
 * Connects to local Ollama server at http://localhost:11434
 */

import type { RelayAgent, AgentType } from '../relayStore'

export const OLLAMA_BASE = 'http://localhost:11434'
export const RELAY_MODEL = 'llama3.2:1b'

/** Check if Ollama is reachable */
export async function pingOllama(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}

/** Per-agent-type system prompts */
const SYSTEM_PROMPTS: Record<AgentType, string> = {
  sales:
    `You are {name}, an AI sales agent specialized in lead qualification, follow-up, and email outreach. 
Your skills: {skills}.
Be direct, professional, and results-oriented. Help with lead scoring, sales pipelines, proposals, and customer engagement strategies.
Keep responses concise and actionable. You are running inside the RELAY AI Workforce Operating System.`,

  support:
    `You are {name}, an AI customer support agent specialized in ticket resolution, escalation management, and customer satisfaction.
Your skills: {skills}.
Be empathetic, clear, and solution-focused. Provide step-by-step troubleshooting, draft support responses, and help classify issues by priority.
Keep responses concise. You are running inside the RELAY AI Workforce Operating System.`,

  analyst:
    `You are {name}, an AI data analyst specialized in reports, data analysis, insights, and forecasting.
Your skills: {skills}.
Be precise, structured, and data-driven. Help interpret metrics, identify patterns, suggest KPIs, and create structured reports.
Use bullet points and tables when helpful. You are running inside the RELAY AI Workforce Operating System.`,

  voice:
    `You are {name}, an AI voice agent specialized in call handling, transcription, and scheduling.
Your skills: {skills}.
Be conversational and clear. Help draft call scripts, summarize transcripts, suggest responses for inbound calls, and manage scheduling logic.
You are running inside the RELAY AI Workforce Operating System.`,

  vision:
    `You are {name}, an AI vision agent specialized in document analysis, image understanding, and data extraction.
Your skills: {skills}.
Be precise and detail-oriented. Help analyze documents, extract structured data from text descriptions, identify document types, and validate extracted fields.
You are running inside the RELAY AI Workforce Operating System.`,

  orchestrator:
    `You are {name}, the central AI orchestrator. You coordinate and delegate tasks between all agents in the RELAY ecosystem.
Your skills: {skills}.
You have a bird's-eye view of all operations. Help with task routing decisions, agent delegation strategies, workflow design, and system-level coordination.
Be strategic, precise, and systems-thinking. You are running inside the RELAY AI Workforce Operating System.`,
}

export function buildSystemPrompt(agent: RelayAgent): string {
  const template = SYSTEM_PROMPTS[agent.type]
  return template
    .replace('{name}', agent.name)
    .replace('{skills}', agent.skills.join(', '))
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Stream a chat completion from Ollama.
 * Calls `onToken` for each streamed token, returns the full response.
 */
export async function streamChat(
  messages: OllamaMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: RELAY_MODEL,
      messages,
      stream: true,
    }),
    signal,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Ollama error ${res.status}: ${err}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      if (!line.trim()) continue
      try {
        const json = JSON.parse(line) as {
          message?: { content: string }
          done: boolean
        }
        if (json.message?.content) {
          const token = json.message.content
          full += token
          onToken(token)
        }
      } catch {
        // partial JSON line, skip
      }
    }
  }

  return full
}
