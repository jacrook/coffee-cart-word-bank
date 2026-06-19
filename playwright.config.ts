import { defineConfig, devices } from '@playwright/test';

const PREVIEW_PORT = 4173;
const PREVIEW_HOST = '127.0.0.1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://${PREVIEW_HOST}:${PREVIEW_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'iPhone 14',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'Pixel 7',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --host ${PREVIEW_HOST} --port ${PREVIEW_PORT}`,
    url: `http://${PREVIEW_HOST}:${PREVIEW_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});