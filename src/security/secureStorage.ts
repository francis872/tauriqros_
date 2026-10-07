const PREFIX = 'tauriq.secure.v1.'

function xor(text: string, seed: string) {
  return text
    .split('')
    .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ seed.charCodeAt(index % seed.length)))
    .join('')
}

export function writeSecure(key: string, value: string, seed: string) {
  try {
    const encrypted = btoa(xor(value, seed))
    window.localStorage.setItem(`${PREFIX}${key}`, encrypted)
  } catch {
    // Ignore failures.
  }
}

export function readSecure(key: string, seed: string): string | null {
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${key}`)
    if (!raw) {
      return null
    }

    return xor(atob(raw), seed)
  } catch {
    return null
  }
}
