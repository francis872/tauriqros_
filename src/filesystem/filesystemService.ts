import { DARE_WORKSPACE_PATH } from '../apps/dareWorkspace'
import { invokeNativeSafe } from '../services/tauriBridge'

export interface FilesystemEntry {
  name: string
  path: string
  kind: 'file' | 'directory' | 'symlink' | 'other'
  size: number
  modifiedAt?: string
}

export interface FilesystemDirectorySnapshot {
  path: string
  entries: FilesystemEntry[]
  source: 'native' | 'fallback'
}

function normalizePath(path: string) {
  if (!path || path === '/') {
    return '/'
  }

  return path.replace(/\\\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '')
}

const FALLBACK_TREE: Record<string, FilesystemEntry[]> = {
  '/': [
    { name: 'Home', path: '/Home', kind: 'directory', size: 0 },
    { name: 'Projects', path: '/Projects', kind: 'directory', size: 0 },
    { name: 'Documents', path: '/Documents', kind: 'directory', size: 0 },
    { name: '.tauriq', path: '/.tauriq', kind: 'directory', size: 0 },
    { name: 'README.md', path: '/README.md', kind: 'file', size: 2100 },
  ],
  '/Home': [
    { name: 'Desktop', path: '/Home/Desktop', kind: 'directory', size: 0 },
    { name: 'Pictures', path: '/Home/Pictures', kind: 'directory', size: 0 },
    { name: 'notes.txt', path: '/Home/notes.txt', kind: 'file', size: 512 },
  ],
  '/Projects': [
    { name: 'tauriq-os', path: '/Projects/tauriq-os', kind: 'directory', size: 0 },
    { name: 'launcher-runtime', path: '/Projects/launcher-runtime', kind: 'directory', size: 0 },
    { name: 'ai-context-engine', path: '/Projects/ai-context-engine', kind: 'directory', size: 0 },
  ],
  '/Documents': [
    { name: 'Architecture.pdf', path: '/Documents/Architecture.pdf', kind: 'file', size: 4_200_000 },
    { name: 'roadmap.md', path: '/Documents/roadmap.md', kind: 'file', size: 18_000 },
  ],
  [DARE_WORKSPACE_PATH]: [
    { name: 'jumper', path: `${DARE_WORKSPACE_PATH}/jumper`, kind: 'directory', size: 0 },
    { name: 'README.md', path: `${DARE_WORKSPACE_PATH}/README.md`, kind: 'file', size: 220 },
  ],
  [`${DARE_WORKSPACE_PATH}/jumper`]: [],
}

async function fallbackDirectory(path: string): Promise<FilesystemDirectorySnapshot> {
  const normalized = normalizePath(path)

  return {
    path: normalized,
    entries: FALLBACK_TREE[normalized] ?? [],
    source: 'fallback',
  }
}

export async function readDirectory(path: string): Promise<FilesystemDirectorySnapshot> {
  const normalized = normalizePath(path)

  return invokeNativeSafe<FilesystemDirectorySnapshot>(
    'filesystem_read_directory',
    { path: normalized },
    () => fallbackDirectory(normalized),
  )
}

export interface DirectoryTraversalOptions {
  maxDepth?: number
  maxEntries?: number
}

export async function readDirectoryRecursive(
  path: string,
  options: DirectoryTraversalOptions = {},
): Promise<FilesystemEntry[]> {
  const normalized = normalizePath(path)
  const visited = new Set<string>()
  const entries: FilesystemEntry[] = []
  const { maxDepth = 7, maxEntries = 1200 } = options

  async function traverse(currentPath: string, depth: number) {
    if (depth > maxDepth || entries.length >= maxEntries || visited.has(currentPath)) {
      return
    }

    visited.add(currentPath)

    let snapshot: FilesystemDirectorySnapshot
    try {
      snapshot = await readDirectory(currentPath)
    } catch {
      return
    }

    for (const entry of snapshot.entries) {
      if (entries.length >= maxEntries) {
        break
      }

      const entryPath = normalizePath(
        `${currentPath === '/' ? '' : currentPath}/${entry.name}`,
      )
      entries.push({
        ...entry,
        path: entryPath,
      })

      if (entry.kind === 'directory') {
        await traverse(entryPath, depth + 1)
      }
    }
  }

  await traverse(normalized, 0)
  return entries
}

export async function detectMountedDrives(): Promise<string[]> {
  return invokeNativeSafe<string[]>(
    'filesystem_list_mounts',
    undefined,
    () => Promise.resolve(['/']),
  )
}
