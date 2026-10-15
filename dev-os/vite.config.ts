/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },

  build: {
    rollupOptions: {
      output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-redux')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/@reduxjs')) {
              return 'vendor-redux';
            }
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons') || id.includes('node_modules/framer-motion') || id.includes('node_modules/sonner')) {
              return 'vendor-ui';
            }
            if (id.includes('node_modules/react-markdown')) {
              return 'vendor-markdown';
            }
          },
      },
    },
  },
})