const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V370 keeps Forge information compact and out of the combat header', async () => {
  const root = path.join(__dirname, '..');
  const compare = fs.readFileSync(path.join(root, 'forge-comparison-authority-v146.js'), 'utf8');
  const safety = fs.readFileSync(path.join(root, 'forge-equipment-safety-v151.js'), 'utf8');
  const auto = fs.readFileSync(path.join(root, 'auto-forge-compare-v199.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(compare).toContain('Forge comparison authority v146 / V378');
  expect(compare).toContain("bottom='calc(env(safe-area-inset-bottom) + 64px)'");
  expect(compare).toContain('maxHeight');
  expect(compare).toContain('grid-template-columns:1.05fr .9fr 1fr');
  expect(compare).toContain('>ÉQUIPER</button>');
  expect(compare).toContain("more?'GARDER · SUIVANT':'GARDER'");
  expect(compare).toContain('RECYCLER');

  expect(safety).toContain("more?'GARDER · SUIVANT':'GARDER'");
  expect(safety).toContain("setText(equip,'ÉQUIPER')");

  expect(auto).toContain('Auto-Forge Compare V199 / V378');
  expect(auto).toContain("settleAutoDust(res,dustBefore,!document.getElementById('srForgeLoot273'))");
  expect(auto).toContain('__srAutoForgeDustV370');

  expect(index).toContain('name="shadowreach-build"');
  expect(index).toContain('forge-comparison-authority-v146.js?v=');
  expect(index).toContain('forge-equipment-safety-v151.js?v=');
  expect(index).toContain('auto-forge-compare-v199.js?v=');
});
