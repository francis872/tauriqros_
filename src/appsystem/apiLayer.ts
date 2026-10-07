import { runtimeApiGetHealth, filesystemApiGetSemanticSummary, aiApiInfer } from '../services/platformApi'

export async function runtimeApi() {
  return runtimeApiGetHealth()
}

export async function filesystemApi(query: string) {
  return filesystemApiGetSemanticSummary(query)
}

export async function aiApi(prompt: string) {
  return aiApiInfer(prompt)
}
