const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test',
  testMatch: '*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:8045',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx http-server ./ -p 8045',
    url: 'http://127.0.0.1:8045',
    reuseExistingServer: !process.env.CI,
  },
});
