import { defineConfig } from 'vitest/config'

// Vitest reads this file (not vite.config.ts), so the production build's
// `tsc -b` — which only checks vite.config.ts — is never coupled to test setup.
// Use the automatic JSX runtime so .tsx tests don't need React in scope.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    // Default to Node for pure-logic tests; component tests opt into jsdom with
    // a `// @vitest-environment jsdom` docblock at the top of the file.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // Globals make Testing Library auto-cleanup the DOM after each test.
    globals: true,
  },
})
