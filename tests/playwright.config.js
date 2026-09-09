const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: 'phase*.spec.js',
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
    command: 'python3 -m http.server 8080 --bind 127.0.0.1 --directory ..',
    url: 'http://127.0.0.1:8080/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    // WebKit tracing materially increases protocol/snapshot pressure during the
    // deep Accomplishments modal stress checks and has produced nondeterministic
    // WK target crashes on otherwise identical revisions. Keep the full iPhone
    // suite and real touch input, but leave trace capture to Chromium diagnostics.
    { name: 'webkit-iphone', use: { ...devices['iPhone 13'], trace: 'off' } }
  ]
});
