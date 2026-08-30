import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Admin panel runs on its own port (3001), separate from the customer site (3000).
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
})
