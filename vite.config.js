import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './src/postcss.config.cjs'
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://stay-finder-api.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
}) 