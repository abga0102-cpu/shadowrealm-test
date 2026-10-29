/* Classify historical source-contract specs separately from browser tests.
   The phase* naming convention includes both kinds; Playwright cannot load
   Node-only assert scripts as suites. Keep one shared selection rule. */
const fs = require('node:fs');
const path = require('node:path');

const namedSpecs = new Set([
  'release-stability-legacy-save.spec.js',
  'forge-raid-onboarding-v317.spec.js',
  'forge-raid-navigation-v319.spec.js',
  'forge-power-replacement-v320.spec.js',
  'forge-intro-v321.spec.js',
  'familiar-summon-cost-v322a.spec.js',
  'v322-campaign-canonical.spec.js',
  'forge-rarity-ascension-v323.spec.js',
  'raid-minerai-v323-owner.spec.js'
]);

function eligible(name) {
  return name.endsWith('.spec.js') &&
    (name.startsWith('phase') || namedSpecs.has(name));
}

function classify(root) {
  const dir = path.join(root, 'tests');
  const browser = [];
  const sourceContracts = [];
  for (const name of fs.readdirSync(dir).filter(eligible).sort()) {
    const source = fs.readFileSync(path.join(dir, name), 'utf8');
    if (/\b(?:require\s*\(\s*|from\s*)['"]@playwright\/test['"]/.test(source)) {
      browser.push(name);
    } else {
      sourceContracts.push(name);
    }
  }
  return { browser, sourceContracts };
}

module.exports = { classify };
