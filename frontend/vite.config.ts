import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // TEMP dev without Docker: allow access via cloudflared quick tunnels (https)
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com'],
  },
})
