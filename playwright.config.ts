import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.TEST_ENV || 'prod';
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // ── UI / E2E projects ──────────────────────────────────────────────────
    {
      name: 'chromium',
      testMatch: '**/e2e/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.BASE_URL },
    },
    {
      name: 'firefox',
      testMatch: '**/e2e/**/*.spec.ts',
      use: { ...devices['Desktop Firefox'], baseURL: process.env.BASE_URL },
    },
    {
      name: 'webkit',
      testMatch: '**/e2e/**/*.spec.ts',
      use: { ...devices['Desktop Safari'], baseURL: process.env.BASE_URL },
    },

    // ── API projects (no browser) ─────────────────────────────────────────
    // Web-facing API (www.catawiki.com) — BFF endpoints used by the front end
    {
      name: 'api-web',
      testMatch: ['**/api/collections-api.spec.ts', '**/api/lot-navigation-api.spec.ts', '**/api/lot-bids-api.spec.ts'],
      use: { baseURL: process.env.BASE_URL },
    },
  ],
});
