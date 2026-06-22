import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Vitest reads this file (not vite.config.ts), so the production build's
// `tsc -b` — which only checks vite.config.ts — is never coupled to test setup.
export default defineConfig({
  plugins: [react()],
  test: {
    // Pure-logic unit tests run in Node; no DOM needed.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
