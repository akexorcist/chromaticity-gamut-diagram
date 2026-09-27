import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
  },
})
