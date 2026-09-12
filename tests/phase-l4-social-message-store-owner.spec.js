const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('L4: Social owns the shared message-store policy for its extensions', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  const social = source('social-v1.js');
  const p2p = source('social-p2p-v1.js');
  const bots = source('social-bot-testers-v5.js');

  expect(index).toContain("chain(['social-v1.js','social-p2p-v1.js'].concat(core)");
  expect(index.indexOf("chain(['social-v1.js','social-p2p-v1.js']")).toBeLessThan(index.indexOf("chain(['social-bot-testers-v5.js','social-bot-ui-v1.js']"));

  expect(social).toContain('function serialize(list){return JSON.stringify(list.slice(-MAX))}');
  expect(social).toContain('window.__srSocialMessageStoreV1={key:KEY,max:MAX,read,serialize};');

  expect(p2p).toContain('const messageStore=window.__srSocialMessageStoreV1;');
  expect(p2p).toContain('const read=messageStore.read;');
  expect(p2p).toContain('messageStore.serialize(a)');
  expect(p2p).not.toContain('JSON.parse(localStorage.getItem(STORE)||"[]")');
  expect(p2p).not.toContain('MAX=160');
  expect(p2p).toContain('newValue:JSON.stringify(list)');

  expect(bots).toContain('const messageStore=window.__srSocialMessageStoreV1;');
  expect(bots).toContain('const rd=messageStore.read;');
  expect(bots).toContain('messageStore.serialize(a)');
  expect(bots).not.toContain('JSON.parse(localStorage.getItem(STORE)||"[]")');
  expect(bots).not.toContain('MAX=160');
  expect(bots).toContain('newValue:JSON.stringify(a)');
});

test('L4: Social message-store API preserves malformed-input and 160-message retention semantics', async ({ page }) => {
  await page.goto('/index.html?social=1');
  await page.waitForFunction(() => window.__srSocialMessageStoreV1 && document.querySelector('script[src*="social-p2p-v1.js"]'));

  const result = await page.evaluate(() => {
    const store = window.__srSocialMessageStoreV1;
    const previous = localStorage.getItem(store.key);
    try {
      localStorage.setItem(store.key, '{bad json');
      const malformed = store.read();
      const sample = Array.from({ length: 165 }, (_, i) => ({ id: 'm' + i }));
      const serialized = store.serialize(sample);
      localStorage.setItem(store.key, serialized);
      const readBack = store.read();
      return {
        key: store.key,
        max: store.max,
        malformedLength: malformed.length,
        serializedLength: JSON.parse(serialized).length,
        firstSerializedId: JSON.parse(serialized)[0].id,
        readLength: readBack.length,
        firstReadId: readBack[0].id,
      };
    } finally {
      if (previous === null) localStorage.removeItem(store.key);
      else localStorage.setItem(store.key, previous);
    }
  });

  expect(result).toEqual({
    key: 'shadowreach.social.v1.messages',
    max: 160,
    malformedLength: 0,
    serializedLength: 160,
    firstSerializedId: 'm5',
    readLength: 160,
    firstReadId: 'm5',
  });
});
