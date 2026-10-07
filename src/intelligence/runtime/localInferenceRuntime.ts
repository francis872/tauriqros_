import { OLLAMA_BASE, RELAY_MODEL } from '../../apps/relay/lib/ollama'

export type InferenceExecutionMode = 'local' | 'cloud' | 'hybrid' | 'distributed-peer'

export interface LocalInferenceRequest {
  prompt: string
  modelId: string
  mode: InferenceExecutionMode
  maxTokens?: number
}

export interface LocalInferenceResult {
  output: string
  modelId: string
  mode: InferenceExecutionMode
  tokens: number
  latencyMs: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function runLocalInference(request: LocalInferenceRequest): Promise<LocalInferenceResult> {
  const startedAt = performance.now()

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: RELAY_MODEL,
        prompt: request.prompt,
        stream: false,
        options: { num_predict: request.maxTokens ?? 300 },
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) throw new Error(`Ollama ${res.status}`)

    const data = await res.json() as { response: string; eval_count?: number }

    return {
      output: data.response.trim(),
      modelId: RELAY_MODEL,
      mode: 'local',
      tokens: data.eval_count ?? 0,
      latencyMs: Number((performance.now() - startedAt).toFixed(1)),
    }
  } catch {
    return {
      output: `Local runtime fallback processed: ${request.prompt.slice(0, 72)}`,
      modelId: request.modelId,
      mode: request.mode,
      tokens: 0,
      latencyMs: Number((performance.now() - startedAt).toFixed(1)),
    }
  }
}

/** Uses the Ollama /api/chat endpoint to maintain conversation history. */
export async function runChatInference(
  messages: ChatMessage[],
  maxTokens = 512,
): Promise<LocalInferenceResult> {
  const startedAt = performance.now()

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: RELAY_MODEL,
        messages,
        stream: false,
        options: { num_predict: maxTokens },
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) throw new Error(`Ollama ${res.status}`)

    const data = await res.json() as { message: { content: string }; eval_count?: number }

    return {
      output: data.message.content.trim(),
      modelId: RELAY_MODEL,
      mode: 'local',
      tokens: data.eval_count ?? 0,
      latencyMs: Number((performance.now() - startedAt).toFixed(1)),
    }
  } catch {
    return {
      output: '',
      modelId: RELAY_MODEL,
      mode: 'local',
      tokens: 0,
      latencyMs: Number((performance.now() - startedAt).toFixed(1)),
    }
  }
}


