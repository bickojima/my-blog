import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const baseURL = process.env.APP_INFO_BASE_URL || 'http://127.0.0.1:4178';

export default defineConfig({
  testDir: '../../tests/e2e',
  testMatch: 'app-info.spec.ts',
  outputDir: './screenshots',
  timeout: 30000,
  retries: 0,
  workers: 3,
  reporter: [['list'], ['json', { outputFile: './app-info-results.json' }]],
  use: { baseURL, headless: true },
  projects: [
    { name: 'PC', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } } },
    { name: 'iPad', use: { browserName: 'chromium', ...devices['iPad Pro 11'] } },
    { name: 'iPhone', use: { browserName: 'chromium', ...devices['iPhone 14'] } },
  ],
  webServer: process.env.APP_INFO_BASE_URL ? undefined : {
    command: 'npx serve dist -l tcp://127.0.0.1:4178',
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    url: baseURL,
    reuseExistingServer: false,
  },
});
