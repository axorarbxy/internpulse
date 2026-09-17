import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(currentDir, 'node_modules/react'),
      'react-dom': path.resolve(currentDir, 'node_modules/react-dom'),
      axios: path.resolve(currentDir, 'node_modules/axios'),
      'socket.io-client': path.resolve(currentDir, 'node_modules/socket.io-client'),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(currentDir, '../../Module-04/frontend/src')],
    },
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
