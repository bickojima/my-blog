// FR-29（E-46）の単独実行用。
//   ローカルdist:  npx playwright test --config evidence/2026-09-09/verify-app-info.config.ts
//   staging実機:   APP_INFO_BASE_URL=https://staging.reiwa.casa npx playwright test \
//                    --config evidence/2026-09-09/verify-app-info.config.ts \
//                    --output=evidence/2026-09-09/screenshots-staging
// APP_INFO_BASE_URL を渡すとローカルサーバーは起動しない。結果JSONは同じ名前で上書きされるため、
// 実機実行の結果は app-info-results-staging.json へ手動で退避する。
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
  reporter: [['list'], ['json', { outputFile: process.env.APP_INFO_RESULT_FILE || './app-info-results.json' }]],
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
