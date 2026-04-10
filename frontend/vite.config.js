import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [react()],
  preview: {
    allowedHosts: ['suitable-foundations-rpg-one.trycloudflare.com']
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'https://textiles-discounted-restore-movements.trycloudflare.com', changeOrigin: true },
      '/uploads': { target: 'https://textiles-discounted-restore-movements.trycloudflare.com', changeOrigin: true }
    }
  }
})