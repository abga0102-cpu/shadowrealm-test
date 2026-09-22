const { defineConfig } = require('@playwright/test');
const current = require('./playwright.config');

module.exports = defineConfig({
  ...current,
  // Full non-blocking archaeology/audit suite, including contracts explicitly
  // excluded from the current release gate.
  testMatch: ['*.spec.js'],
  testIgnore: [],
  globalTimeout: undefined,
  reporter: 'list'
});
