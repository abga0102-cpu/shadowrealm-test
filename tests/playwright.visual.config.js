'use strict';
// Separate, opt-in screenshot suite. Never added to the mandatory moving regression ratchet.
const { defineConfig } = require('@playwright/test');
const baseline = require('./playwright.config.js');
module.exports = defineConfig({
  ...baseline,
  testMatch: '**/visual-review.spec.js',
  reporter: [['list']]
});
