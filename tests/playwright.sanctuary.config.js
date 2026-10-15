const { defineConfig, devices } = require('@playwright/test');

// Independent Sanctuary browser suite: no legacy phase* test discovery.
module.exports = defineConfig({
  testDir: __dirname,
  testMatch: ['phase-sanctuary-21-slot-browser.spec.js'],
  fullyParallel: false,
  timeout: 45000,
  expect: { timeout: 7000 },
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:8080', screenshot: 'only-on-failure' },
  webServer: {
    command: 'python3 -m http.server 8080 --bind 127.0.0.1 --directory ..',
    url: 'http://127.0.0.1:8080/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit-iphone', use: { ...devices['iPhone 13'], trace: 'off' } }
  ]
});
