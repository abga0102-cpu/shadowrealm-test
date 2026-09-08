const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: 'phase1.spec.js',
  fullyParallel: false,
  timeout: 45000,
  expect: { timeout: 7000 },
  reporter: process.env.CI ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    // Playwright runs this command relative to the config directory (`tests/`).
    // Serve its parent so the game itself stays a plain static localhost site.
    command: 'python3 -m http.server 8080 --bind 127.0.0.1 --directory ..',
    url: 'http://127.0.0.1:8080/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit-iphone', use: { ...devices['iPhone 13'] } }
  ]
});
