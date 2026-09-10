const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const exists = (name) => fs.existsSync(path.join(root, name));
const executable = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n')
  .trim();

const retired = [
  ['accomplishments-titles-v133.js', '__srAccomplishmentsTitlesV134'],
  ['accomplishments-overview-v135.js', '__srAccomplishmentsOverviewV135'],
  ['accomplishments-home-scope-v136.js', '__srAccomplishmentsHomeScopeV136'],
  ['accomplishments-floors-v137.js', '__srAccomplishmentsFloorsV137'],
];

test('post-4G keeps retired Accomplishments markers out of the loader and allows source retirement', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  for (const [file, marker] of retired) {
    expect(index, `${file} must remain absent from the runtime loader`).not.toContain(file);
    if (exists(file)) expect(executable(source(file))).toContain(marker);
  }

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
