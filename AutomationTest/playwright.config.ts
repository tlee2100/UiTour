// Minimal Node env typing to silence TS when no @types/node is present
declare const process: { env: Record<string, string | undefined> };

import { defineConfig, devices } from '@playwright/test';

// You can override this when running tests, e.g.:
// UI_BASE_URL=http://localhost:4173 npx playwright test
const baseURL = process.env.UI_BASE_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});


