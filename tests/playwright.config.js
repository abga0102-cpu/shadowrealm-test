const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: 'phase*.spec.js',
  fullyParallel: false,
  // GitHub runners otherwise execute multiple spec files/projects in separate
  // workers. The game continuously re-renders animated/touch UI, and concurrent
  // WebKit contexts can produce transient zero-size nodes in unrelated Phase 1
  // tests under runner load. Keep CI deterministic without reducing coverage;
  // local development can still use Playwright's normal worker count.
  workers: process.env.CI ? 1 : undefined,
  timeout: 45000,
  expect: { timeout: 7000 },
  reporter: process.env.CI ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
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
