import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/calc/2027/',
  server: {
    proxy: {
      '/calc/2027/api': {
        target: 'http://127.0.0.1:8088',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/calc\/2027\/api/, '/api'),
      },
    },
  },
})
