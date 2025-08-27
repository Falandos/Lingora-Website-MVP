import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for real PHP backend
// Use this when switching from mock server to real backend

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:80', // XAMPP Apache port
        changeOrigin: true,
        rewrite: (path) => `/lingora/backend/public${path}`, // Adjust path to your backend
      },
    },
  },
})