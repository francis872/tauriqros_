import type { RuntimeModelDescriptor } from './localModelRegistry'

export function detectModelCapabilities(model: RuntimeModelDescriptor) {
  return {
    id: model.id,
    streaming: true,
    embeddings: model.provider !== 'peer',
    rag: model.provider === 'local' || model.provider === 'hybrid',
    distributed: model.provider === 'peer' || model.provider === 'hybrid',
  }
}
