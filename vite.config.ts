import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs/promises'

const DARE_BUILD_DIR = path.resolve(__dirname, '..', '..', 'DARE', 'curso-react-intro', 'build')
const DARE_PUBLIC_ROUTE = '/dare'

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
}

function lookupMimeType(filePath: string) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
}

function rewriteDareHtml(html: string) {
  const withBase = html.replace(/<base href="\/">/g, `<base href="${DARE_PUBLIC_ROUTE}/">`)
  const rootAssetRegex = /(["'])(\/(?!dare\/|@vite\/client|@react-refresh)(static\/[^"']+|favicon\.ico|manifest\.json|asset-manifest\.json|robots\.txt|logo192\.png|logo512\.png|react192\.png|react512\.png|[^"']+\.webmanifest|[^"']+\.svg|[^"']+\.png|[^"']+\.jpg|[^"']+\.jpeg|[^"']+\.json))(["'])/g
  return withBase.replace(rootAssetRegex, `$1${DARE_PUBLIC_ROUTE}$2$4`)
}

function dareStaticAssetPlugin() {
  return {
    name: 'dare-static-assets',
    configureServer(server: { middlewares: any }) {
      const handler = async (req: any, res: any, next: any) => {
        if (!req.url) {
          return next()
        }

        const requestUrl = req.url.split('?')[0]
        if (
          requestUrl === DARE_PUBLIC_ROUTE ||
          requestUrl === `${DARE_PUBLIC_ROUTE}/` ||
          requestUrl === `${DARE_PUBLIC_ROUTE}/index.html`
        ) {
          try {
            const html = await fs.readFile(path.join(DARE_BUILD_DIR, 'index.html'), 'utf-8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            res.end(rewriteDareHtml(html))
            return
          } catch {
            return next()
          }
        }

        if (requestUrl.startsWith(`${DARE_PUBLIC_ROUTE}/`)) {
          const relativePath = requestUrl.slice(`${DARE_PUBLIC_ROUTE}/`.length)
          const filePath = path.join(DARE_BUILD_DIR, relativePath)
          try {
            const file = await fs.readFile(filePath)
            res.statusCode = 200
            res.setHeader('Content-Type', lookupMimeType(filePath))
            res.end(file)
            return
          } catch {
            return next()
          }
        }

        return next()
      }

      if (Array.isArray(server.middlewares?.stack)) {
        server.middlewares.stack.unshift({ route: '', handle: handler })
      } else {
        server.middlewares.use(handler)
      }
    },
    async closeBundle() {
      const targetDir = path.resolve(__dirname, 'dist', 'dare')
      await fs.cp(DARE_BUILD_DIR, targetDir, { recursive: true }).catch(() => undefined)
      const indexPath = path.join(targetDir, 'index.html')
      try {
        const html = await fs.readFile(indexPath, 'utf-8')
        await fs.writeFile(indexPath, rewriteDareHtml(html), 'utf-8')
      } catch {
        // ignore missing files
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dareStaticAssetPlugin()],
})
