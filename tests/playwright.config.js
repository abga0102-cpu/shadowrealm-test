const { defineConfig, devices } = require('@playwright/test');

// These files are retained as archaeology/ownership history, but their exact
// assertions describe superseded V317-V333 implementations rather than the
// current V364-V370 game. They stay runnable in test:e2e:historical and are
// modernized one-by-one before returning to the blocking release gate.
const HISTORICAL_CONTRACTS = [
  'forge-intro-v321.spec.js',
  'forge-power-replacement-v320.spec.js',
  'forge-raid-navigation-v319.spec.js',
  'forge-raid-onboarding-v317.spec.js',
  'phase-accomplishments-claim-lifecycle.spec.js',
  'phase-accomplishments-visual-v331.spec.js',
  'phase-easy-dragon-v333.spec.js',
  'phase-hero-equipment-v1-runtime-unload.spec.js',
  'phase-navigation-dedup.spec.js',
  'phase-runtime-inventory.spec.js',
  'phase3-compatibility.spec.js',
  'phase4g-raid100-migration.spec.js',
  'phase4m-combat-profiles-v313.spec.js',
  'phase4n-campaign-400-v314.spec.js',
  'phase4n-campaign-accomplishments-v314.spec.js',
  'phase4o-forge-master-stage-flow-v316.spec.js',
  'v322-campaign-canonical.spec.js'
];

module.exports = defineConfig({
  testDir: __dirname,
  // Keep the broad regression net. Only explicitly classified superseded
  // contracts are non-blocking; current Dust/save/V369/V370 coverage remains.
  testMatch: [
    'phase*.spec.js',
    'release-stability-legacy-save.spec.js',
    'forge-raid-onboarding-v317.spec.js',
    'forge-raid-navigation-v319.spec.js',
    'forge-power-replacement-v320.spec.js',
    'forge-intro-v321.spec.js',
    'familiar-summon-cost-v322a.spec.js',
    'v322-campaign-canonical.spec.js',
    'forge-rarity-ascension-v323.spec.js',
    'raid-minerai-v323-owner.spec.js',
    'save-startup-safety-v340.spec.js',
    'save-recovery-v341.spec.js',
    'v342-pending-boss-progression.spec.js'
  ],
  testIgnore: HISTORICAL_CONTRACTS,
  fullyParallel: false,
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
