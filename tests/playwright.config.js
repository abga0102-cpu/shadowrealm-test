const { defineConfig, devices } = require('@playwright/test');

const CURRENT_RELEASE_SPECS = [
  'phase1.spec.js',
  'phase4h-progression-state-safety.spec.js',
  'phase4i-familiar-flat-ui.spec.js',
  'phase4j-progression-consolidation-v310.spec.js',
  'phase4k-progression-playthrough-v311.spec.js',
  'phase4l-tutorial-feedback-v312.spec.js',
  'phase-familiar-fusion-ladder-v334.spec.js',
  'phase-mega-rewards-v329-v330.spec.js',
  'phase-raid-power-v324.spec.js',
  'familiar-summon-cost-v322a.spec.js',
  'forge-rarity-ascension-v323.spec.js',
  'raid-minerai-v323-owner.spec.js',
  'save-startup-safety-v340.spec.js',
  'save-recovery-v341.spec.js',
  'v342-pending-boss-progression.spec.js'
];

module.exports = defineConfig({
  testDir: __dirname,
  // Blocking release gate = current player-facing contracts only.
  // Historical Vxxx archaeology remains in the repository and can be run with
  // npm run test:e2e:historical, but obsolete markup/exact-value assertions no
  // longer make an unrelated current release red.
  testMatch: CURRENT_RELEASE_SPECS,
  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,
  timeout: 45000,
  globalTimeout: process.env.CI ? 15 * 60 * 1000 : undefined,
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
    { name: 'webkit-iphone', use: { ...devices['iPhone 13'], trace: 'off' } }
  ]
});
