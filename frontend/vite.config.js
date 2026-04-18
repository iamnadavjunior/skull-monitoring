import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/skull-monitoring/',
  build: {
    outDir: '../public',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/skull-monitoring/api': {
        target: 'http://localhost',
        changeOrigin: true,
      }
    }
  }
})
