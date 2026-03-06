import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/prescriptions': 'http://localhost:8000',
      '/medications': 'http://localhost:8000',
      '/safety': 'http://localhost:8000',
      '/interactions': 'http://localhost:8000',
      '/reports': 'http://localhost:8000',
      '/intake': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
    }
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
