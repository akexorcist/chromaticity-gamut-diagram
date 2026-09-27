import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  webServer: [
    {
      command: 'npm run build && npm run preview -- --port 4321 --strictPort',
      port: 4321,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: 'python3 -m http.server 4322 --directory legacy',
      port: 4322,
      reuseExistingServer: !process.env.CI,
      timeout: 20000,
    },
  ],
  use: {
    viewport: { width: 1200, height: 900 },
    acceptDownloads: true,
  },
});
