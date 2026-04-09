import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
    allowedHosts: [
      '.ngrok-free.dev',
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
