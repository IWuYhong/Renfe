import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Escucha en tu red local para que el móvil pueda acceder
    host: true,
    proxy: {
      // Interceptamos cualquier llamada que empiece por '/api'
      '/api': {
        target: 'https://serveisgrs.rodalies.gencat.cat',
        changeOrigin: true,
        secure: false, // Ignora posibles problemas de certificados SSL de Rodalies
      }
    }
  }
})