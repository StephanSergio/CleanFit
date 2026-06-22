import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/CleanFit/',
  build: {
    // The Firebase vendor chunk is ~640 kB and unavoidable; it's deliberately
    // split out and cached, so don't warn about it.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Stable vendor chunks: Firebase and React change rarely, so splitting
        // them out lets the browser cache them across deploys (app code changes
        // don't bust the big vendor bundles).
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase'
          if (id.includes('/react') || id.includes('scheduler')) return 'react'
        },
      },
    },
  },
})
