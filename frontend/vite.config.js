import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['handsome-love-production-6435.up.railway.app']
  },
  build: {
    outDir: 'dist'
  }
})