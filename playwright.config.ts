import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'src/tests',
  testMatch: ['**/*.pl.tsx'],
  use: {
    baseURL: 'http://127.0.0.1:4000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:4000/',
    timeout: 300_000,
    reuseExistingServer: true,
  },
});
