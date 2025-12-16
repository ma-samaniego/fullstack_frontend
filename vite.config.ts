/// <reference types="vitest" /> 
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  test: {
    globals: true, // Para no tener que importar describe, it, etc.
    environment: 'jsdom', // Simula un navegador
    setupFiles: './src/test/setupTest.ts', // Archivo para configurar tests (como jest-dom)
  },
  // --- FIN AÑADIDO ---
})