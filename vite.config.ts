import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the same dist/ output works whether it's served from
  // a GitHub Pages project subpath or from the root of a self-hosted server.
  base: './',
  plugins: [svelte()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
  },
})
