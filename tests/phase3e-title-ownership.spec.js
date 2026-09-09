const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const executable = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

test('Phase 3E leaves v139 as the title interaction owner while v133 keeps chat suppression only', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const legacy = executable(source('accomplishments-titles-v133.js'));
  const canonical = source('accomplishments-canonical-v139.js');

  expect(legacy).toContain('srNoFloatingChatV134');
  expect(legacy).toContain('#srChatBtn');
  expect(legacy).not.toContain('data-ach-title');
  expect(legacy).not.toContain('equippedTitle');
  expect(legacy).not.toContain('saveNow');

  expect(canonical).toContain('__srAccomplishmentsTitleInteractionV139');
  expect(canonical).toContain('data-ach-title="divin"');
  expect(canonical).toContain('S.equippedTitle');
  expect(canonical).toContain('saveNow');
  expect(canonical).toContain("document.addEventListener('click'");
});
