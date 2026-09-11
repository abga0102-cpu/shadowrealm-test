const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function source(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

test('Accomplishments settings entry is owned by canonical V139', async ({ browserName }) => {
  test.skip(browserName !== 'chromium', 'Static ownership guardrail only needs one engine');

  const legacy = source('accomplishments-v121.js');
  const canonical = source('accomplishments-canonical-v139.js');

  expect(legacy).not.toContain('const oldSettings=scrParametres');
  expect(legacy).not.toContain('SCREENS.parametres=scrParametres');
  expect(canonical).toContain('function installSettingsEntry()');
  expect(canonical).toContain('window.__srAccomplishmentsSettingsEntryV139');
  expect(canonical).toContain('data-act="accomplishments"');
  expect(canonical).toContain('SCREENS.parametres=scrParametres');
  expect(canonical).toContain('installTitleInteraction();installSettingsEntry();');
});
