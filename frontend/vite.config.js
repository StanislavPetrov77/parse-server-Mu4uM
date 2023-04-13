import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/parse' : 'http://192.168.1.220:1337'
    }
  },
  plugins: [react()],
})
