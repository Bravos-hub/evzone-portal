import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // allows access via domain / LAN
    allowedHosts: ['portal.evzonecharging.com'],
  },
  preview: {
    host: true,
    allowedHosts: ['portal.evzonecharging.com'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
