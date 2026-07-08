import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

/**
 * Playwright end-to-end config. Tests live in `e2e/` and run against the Vite dev server, which
 * Playwright starts automatically. Browsers are installed in CI (`npx playwright install`).
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
