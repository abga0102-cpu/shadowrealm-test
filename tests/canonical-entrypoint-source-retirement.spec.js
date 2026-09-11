const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const canonical = path.join(root, 'index.html');
const legacyCopy = path.join(root, 'index 2.html');
const playwrightConfig = fs.readFileSync(path.join(root, 'tests', 'playwright.config.js'), 'utf8');

if (!fs.existsSync(canonical)) {
  throw new Error('canonical index.html must remain present');
}
if (fs.existsSync(legacyCopy)) {
  throw new Error('legacy index 2.html must remain retired from the working tree');
}
if (!playwrightConfig.includes('/index.html')) {
  throw new Error('Playwright must continue to target canonical index.html');
}
if (playwrightConfig.includes('index 2.html')) {
  throw new Error('legacy index 2.html must not become a test/runtime entry point');
}

console.log('Canonical entrypoint source retirement contract passed');
