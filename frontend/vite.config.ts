import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/login': 'http://localhost:8080',
      '/logouts': 'http://localhost:8080',
      '/user': 'http://localhost:8080',
      '/admin': 'http://localhost:8080',
      '/forgotpassword': 'http://localhost:8080',
      '/rechangepassword': 'http://localhost:8080',
      '/updateprofile': 'http://localhost:8080',
    },
  },
})
