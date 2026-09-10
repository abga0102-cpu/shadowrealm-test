const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const executable = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n')
  .trim();

const retired = [
  'accomplishments-titles-v133.js',
  'accomplishments-overview-v135.js',
  'accomplishments-home-scope-v136.js',
  'accomplishments-floors-v137.js',
];

test('post-4G stops loading retired Accomplishments compatibility markers', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  for (const file of retired) {
    expect(index).not.toContain(file);
  }

  expect(executable(source('accomplishments-titles-v133.js'))).toContain('__srAccomplishmentsTitlesV134');
  expect(executable(source('accomplishments-overview-v135.js'))).toContain('__srAccomplishmentsOverviewV135');
  expect(executable(source('accomplishments-home-scope-v136.js'))).toContain('__srAccomplishmentsHomeScopeV136');
  expect(executable(source('accomplishments-floors-v137.js'))).toContain('__srAccomplishmentsFloorsV137');

  const stability = source('accomplishments-stability-v138.js');
  const canonical = source('accomplishments-canonical-v139.js');
  expect(stability).toContain('__srAccomplishmentsStabilityV138');
  expect(stability).toContain('data-sr-accomplishments-entry');
  expect(canonical).toContain('__srAccomplishmentsCanonicalV139');
  expect(canonical).toContain('__srAccomplishmentsTitleInteractionV139');
  expect(canonical).toContain('ACT.accomplishments=function');
});

test('retired Accomplishments marker scripts are absent at runtime while canonical owners load', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof S !== 'undefined' && !!window.__srAccomplishmentsCanonicalV139 && !!window.__srAccomplishmentsStabilityV138);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const state = await page.evaluate(() => ({
    titles: typeof window.__srAccomplishmentsTitlesV134,
    overview: typeof window.__srAccomplishmentsOverviewV135,
    homeScope: typeof window.__srAccomplishmentsHomeScopeV136,
    floors: typeof window.__srAccomplishmentsFloorsV137,
    canonical: !!window.__srAccomplishmentsCanonicalV139,
    stability: !!window.__srAccomplishmentsStabilityV138,
  }));

  expect(state).toEqual({
    titles: 'undefined',
    overview: 'undefined',
    homeScope: 'undefined',
    floors: 'undefined',
    canonical: true,
    stability: true,
  });
});
