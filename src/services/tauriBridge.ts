export async function invokeNative<T>(command: string, payload?: Record<string, unknown>): Promise<T> {
  const maybeInvoke = (window as unknown as { __TAURI_INTERNALS__?: { invoke?: (cmd: string, args?: unknown) => Promise<unknown> } }).__TAURI_INTERNALS__?.invoke

  if (!maybeInvoke) {
    throw new Error('native-runtime-unavailable')
  }

  return maybeInvoke(command, payload) as Promise<T>
}

export async function invokeNativeSafe<T>(
  command: string,
  payload: Record<string, unknown> | undefined,
  fallback: () => Promise<T> | T,
): Promise<T> {
  try {
    return await invokeNative<T>(command, payload)
  } catch {
    return fallback()
  }
}
