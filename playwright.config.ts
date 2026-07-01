import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'src/tests',
  timeout: 30000,
  testMatch: ['**/*.pl.tsx'],
  use: {
    baseURL: 'http://127.0.0.1:4000',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:4000/',
    timeout: 180000,
    reuseExistingServer: true
  }
});
