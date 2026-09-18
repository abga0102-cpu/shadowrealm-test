const { defineConfig } = require('@playwright/test');
const current = require('./playwright.config');

module.exports = defineConfig({
  ...current,
  // Non-blocking archaeology/audit suite. Useful when consolidating old owners
  // or intentionally reconciling historical contracts with current behavior.
  testMatch: ['*.spec.js'],
  globalTimeout: undefined,
  reporter: 'list'
});
