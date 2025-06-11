import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000,
    // open: true,
    // cors: true,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const dirs = id.split('node_modules/')[1].split('/')
            const pkgName = dirs[0].startsWith('@') ? `${dirs[0]}/${dirs[1]}` : dirs[0]
            return `vendor-${pkgName}`
          }
        },
      },
    },
  },
})
