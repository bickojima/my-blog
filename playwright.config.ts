import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
  },
  projects: [
    {
      name: 'PC',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'iPad',
      use: { browserName: 'chromium', ...devices['iPad (gen 7)'] },
    },
    {
      name: 'iPhone',
      use: { browserName: 'chromium', ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command: 'npx serve dist -l 4173',
    port: 4173,
    reuseExistingServer: true,
  },
});
