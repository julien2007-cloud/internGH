import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'

// Replit serves the dev preview from its own domains, which Vite blocks by default.
const replitHosts = ['.replit.dev', '.repl.co', '.replit.app']

type Handler = (req: IncomingMessage, res: ServerResponse) => unknown

/**
 * Serve the Vercel functions in api/ during `npm run dev`, so WhatsApp can be
 * tested locally without the Vercel CLI. On Vercel they run as serverless functions.
 */
function apiFunctions(): Plugin {
  return {
    name: 'interngh-api-functions',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        if (!url.pathname.startsWith('/api/')) return next()
        const file = join(server.config.root, 'api', `${url.pathname.slice(5)}.ts`)
        if (url.pathname.includes('/_') || !existsSync(file)) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ error: 'not_found' }))
        }
        try {
          const mod = (await server.ssrLoadModule(file)) as { default: Handler }
          await mod.default(req, res)
        } catch (e) {
          server.ssrFixStacktrace(e as Error)
          console.error(e)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'server_error' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Make server-only secrets from .env.local available to the api/ functions in dev.
  // Only VITE_-prefixed values are ever exposed to the browser bundle.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      apiFunctions(),
    ],
    server: { allowedHosts: replitHosts },
    preview: { allowedHosts: replitHosts },
  }
})
