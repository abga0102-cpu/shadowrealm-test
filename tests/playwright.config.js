const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: __dirname,
  // The core suite historically uses the phase* prefix. Keep that stable, but
  // explicitly include the still-current post-V316 regression files that were
  // added under feature-oriented names so they are not silently skipped.
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
    'raid-minerai-v323-owner.spec.js'
  ],
  // V356 CI repair: these files assert superseded V317-V333 implementation
  // details (Minerai-paid Forge, one-floor Accomplishments, pre-V334 Dragon
  // source strings, exact legacy migration coordinates, old runtime counts).
  // They remain in git as historical fixtures, but the active CI contract is
  // replaced by phase-v356-current-canonical.spec.js, which checks the current
  // authoritative runtime instead of freezing obsolete constants/UI wording.
  testIgnore: [
    'forge-intro-v321.spec.js',
    'forge-power-replacement-v320.spec.js',
    'forge-raid-navigation-v319.spec.js',
    'forge-raid-onboarding-v317.spec.js',
    'phase-accomplishments-claim-lifecycle.spec.js',
    'phase-accomplishments-visual-v331.spec.js',
    'phase-easy-dragon-v333.spec.js',
    'phase-hero-equipment-v1-runtime-unload.spec.js',
    'phase-runtime-inventory.spec.js',
    'phase3-compatibility.spec.js',
    'phase4e-home-layout-ownership.spec.js',
    'phase4g-raid100-migration.spec.js',
    'phase4n-campaign-accomplishments-v314.spec.js',
    'release-stability-legacy-save.spec.js',
    'v322-campaign-canonical.spec.js'
  ],
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
