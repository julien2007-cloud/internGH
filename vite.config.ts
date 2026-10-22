import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// Replit serves the dev preview from its own domains, which Vite blocks by default.
const replitHosts = ['.replit.dev', '.repl.co', '.replit.app']

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: { allowedHosts: replitHosts },
  preview: { allowedHosts: replitHosts },
})
