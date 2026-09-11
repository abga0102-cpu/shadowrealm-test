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
  .join('\n');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof S !== 'undefined' && typeof ACT === 'object' && typeof migrate === 'function');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

/* Accomplishment merge rewards are a queue. Canonical V126 delivers pieces to
   the Sanctuary board/reserve and V212 normalizes legacy rarity names. Count
   every persisted representation so the contract checks conservation rather
   than assuming the source queue remains populated. */
function rareInventoryExpression() {
  return `(() => {
    const st = (typeof sanctMergeState === 'function') ? sanctMergeState() : (S.sanctuary || {});
    const board = Array.isArray(st.mergeBoard)
      ? st.mergeBoard.filter((x) => x === 'RARE' || x === 'RARE_I').length
      : 0;
    const legacyReserve = Array.isArray(st.mergeReserve)
      ? st.mergeReserve.filter((x) => x === 'RARE' || x === 'RARE_I').length
      : (Number(st.mergeReserve && st.mergeReserve.RARE) || 0)
        + (Number(st.mergeReserve && st.mergeReserve.RARE_I) || 0);
    const safeReserve = (Number(st.accomplishmentReserveV135 && st.accomplishmentReserveV135.RARE) || 0)
      + (Number(st.accomplishmentReserveV135 && st.accomplishmentReserveV135.RARE_I) || 0);
    const pending = S.accomplishments && S.accomplishments.mergePieces
      ? (Number(S.accomplishments.mergePieces.RARE) || 0) + (Number(S.accomplishments.mergePieces.RARE_I) || 0)
      : 0;
    return board + legacyReserve + safeReserve + pending;
  })()`;
}

test('Phase 4G makes legacy Raid 100 compensation migration-driven instead of polled', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const legacyFix = executable(source('accomplishments-reward-fix-v127.js'));
  const canonicalClaim = executable(source('accomplishments-claim-v140.js'));
  const canonicalMerge = executable(source('accomplishments-merge-v126.js'));
  const legacyNormalizer = executable(source('sanctuary-legacy-merge-fix-v212.js'));

  expect(legacyFix).not.toContain('setInterval');
  expect(legacyFix).toContain('nativeMigrate');
  expect(legacyFix).toContain('window.migrate=function()');
  expect(legacyFix).toContain('compensateRaid100(migrated)');
  expect(legacyFix).toContain('compensateCurrentState()');
  expect(legacyFix).toContain('setTimeout(compensateCurrentState,50)');

  expect(canonicalClaim).toContain('raid100:{gold:1500000,eclat:1000,essence:1000,merge:{RARE:50},validatedRaid100:true}');
  expect(canonicalClaim).toContain('raid100ValidatedV127=true');

  expect(canonicalMerge).toContain('__srSyncAccomplishmentMergeV126');
  expect(canonicalMerge).toContain('pending[r]=0');
  expect(canonicalMerge).toContain('st.mergeReserve[r]=(st.mergeReserve[r]||0)+1');
  expect(canonicalMerge).not.toContain('setInterval');
  expect(legacyNormalizer).toContain("RARE:'RARE_I'");
  expect(exists('accomplishments-merge-safe-v135.js')).toBe(false);
});

test('live import of a legacy Raid 100 claim receives the exact one-time compensation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Migration behavior is engine-independent.');
  await openCleanGame(page);

  const rareExpr = rareInventoryExpression();
  const result = await page.evaluate(async (rareExpression) => {
    const rareInventory = () => Function(`return ${rareExpression}`)();
    const raw = JSON.parse(JSON.stringify(S));
    raw.gold = 1000;
    raw.eclat = 10;
    raw.essence = 20;
    raw.accomplishments = raw.accomplishments && typeof raw.accomplishments === 'object' ? raw.accomplishments : {};
    raw.accomplishments.claimed = raw.accomplishments.claimed && typeof raw.accomplishments.claimed === 'object' ? raw.accomplishments.claimed : {};
    raw.accomplishments.mergePieces = raw.accomplishments.mergePieces && typeof raw.accomplishments.mergePieces === 'object' ? raw.accomplishments.mergePieces : {};
    raw.accomplishments.claimed.raid100 = true;
    delete raw.accomplishments.raid100ValidatedV127;
    raw.accomplishments.mergePieces.RARE = 3;

    const nativeCreate = document.createElement.bind(document);
    const NativeFileReader = window.FileReader;
    document.createElement = function(tagName) {
      const el = nativeCreate(tagName);
      if (String(tagName).toLowerCase() === 'input') {
        el.click = function() {
          Object.defineProperty(el, 'files', { value: [{ name: 'phase4g-legacy-raid100.json' }], configurable: true });
          if (typeof el.onchange === 'function') el.onchange();
        };
      }
      return el;
    };
    window.FileReader = class {
      readAsText() {
        this.result = JSON.stringify(raw);
        Promise.resolve().then(() => { if (typeof this.onload === 'function') this.onload(); });
      }
    };

    try {
      ACT.importSave();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const first = {
        gold: Number(S.gold),
        eclat: Number(S.eclat),
        essence: Number(S.essence),
        rare: rareInventory(),
        validated: !!(S.accomplishments && S.accomplishments.raid100ValidatedV127),
      };
      await new Promise((resolve) => setTimeout(resolve, 700));
      const later = {
        gold: Number(S.gold),
        eclat: Number(S.eclat),
        essence: Number(S.essence),
        rare: rareInventory(),
        validated: !!(S.accomplishments && S.accomplishments.raid100ValidatedV127),
      };
      return { first, later };
    } finally {
      document.createElement = nativeCreate;
      window.FileReader = NativeFileReader;
    }
  }, rareExpr);

  expect(result.first).toEqual({
    gold: 501000,
    eclat: 260,
    essence: 270,
    rare: 23,
    validated: true,
  });
  expect(result.later).toEqual(result.first);
});

test('canonical Raid 100 claims pay the validated reward directly and stamp the migration flag', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Claim ownership is engine-independent.');
  await openCleanGame(page);

  await page.evaluate(() => {
    S.gold = 0;
    S.eclat = 0;
    S.essence = 0;
    S.accomplishments = S.accomplishments && typeof S.accomplishments === 'object' ? S.accomplishments : {};
    S.accomplishments.claimed = S.accomplishments.claimed && typeof S.accomplishments.claimed === 'object' ? S.accomplishments.claimed : {};
    S.accomplishments.mergePieces = S.accomplishments.mergePieces && typeof S.accomplishments.mergePieces === 'object' ? S.accomplishments.mergePieces : {};
    S.accomplishments.raidWins = 100;
    S.accomplishments.claimed.raid100 = false;
    delete S.accomplishments.raid100ValidatedV127;
    S.accomplishments.mergePieces.RARE = 0;
    ACT.accomplishments();
  });

  const claim = page.locator('#overlay .srAch139 [data-ach="raid100"]');
  await expect(claim).toHaveCount(1);
  await claim.click();

  const rareExpr = rareInventoryExpression();
  const result = await page.evaluate((rareExpression) => {
    const rareInventory = () => Function(`return ${rareExpression}`)();
    return {
      gold: Number(S.gold),
      eclat: Number(S.eclat),
      essence: Number(S.essence),
      rare: rareInventory(),
      claimed: !!(S.accomplishments && S.accomplishments.claimed && S.accomplishments.claimed.raid100),
      validated: !!(S.accomplishments && S.accomplishments.raid100ValidatedV127),
    };
  }, rareExpr);

  expect(result).toEqual({
    gold: 1500000,
    eclat: 1000,
    essence: 1000,
    rare: 50,
    claimed: true,
    validated: true,
  });
});
