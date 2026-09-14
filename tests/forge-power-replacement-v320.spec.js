const { test, expect } = require('@playwright/test');

test('V320 Forge compares replacement Power and keeps all three decisions available', async ({ page }) => {
  test.setTimeout(20000);

  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#homeForge')).toHaveCount(1, { timeout: 10000 });

  const setup = await page.evaluate(() => {
    S.minerai = 1e12;
    const firstBySlot = Object.create(null);
    let firstResult = null;
    let secondResult = null;

    for (let i = 0; i < 100 && !secondResult; i += 1) {
      const results = forgeSummon(1) || [];
      for (const r of results) {
        if (!r || r.recycled || !r.id) continue;
        const it = (S.inventory || []).find(x => x && x.id === r.id);
        if (!it || !it.slot) continue;
        if (firstBySlot[it.slot]) {
          firstResult = firstBySlot[it.slot];
          secondResult = r;
          break;
        }
        firstBySlot[it.slot] = r;
      }
    }

    if (!firstResult || !secondResult) throw new Error('V320 could not forge two items for the same slot');
    const first = (S.inventory || []).find(x => x && x.id === firstResult.id);
    const second = (S.inventory || []).find(x => x && x.id === secondResult.id);
    if (!first || !second) throw new Error('V320 forged items missing from inventory');

    equipItem(first.id);
    const equippedBefore = S.equipped && S.equipped[second.slot];
    if (!equippedBefore || equippedBefore.id !== first.id) throw new Error('V320 setup failed to equip baseline item');

    const powerBefore = Number(S.power || computePower(S) || 0);
    const previewEquipped = Object.assign({}, S.equipped || {});
    previewEquipped[second.slot] = second;
    const powerAfter = Number(computePower(Object.assign({}, S, { equipped: previewEquipped })) || 0);

    window.__forgeV320 = {
      slot: second.slot,
      oldId: first.id,
      newId: second.id,
      secondResult,
      powerBefore,
      powerAfter,
    };
    showForgeResult([secondResult]);
    return { slot: second.slot, oldId: first.id, newId: second.id, powerBefore, powerAfter };
  });

  const panel = page.locator('#srForgeArenaPreview146');
  await expect(panel).toHaveCount(1, { timeout: 3000 });
  const powerPreview = panel.locator('[data-sr-forge-power-v320="1"]');
  await expect(powerPreview).toContainText('PUISSANCE ACTUELLE');
  await expect(powerPreview).toContainText('SI ÉQUIPÉ');
  await expect(powerPreview.locator('[data-sr-forge-power-before-v320]')).not.toBeEmpty();
  await expect(powerPreview.locator('[data-sr-forge-power-after-v320]')).not.toBeEmpty();

  const equip = panel.locator('[data-sr-fp146="equip"]');
  const keep = panel.locator('[data-sr-fp146="keep"]');
  const recycle = panel.locator('[data-sr-fp146="recycle"]');
  await expect(equip).toHaveCount(1);
  await expect(keep).toHaveCount(1);
  await expect(recycle).toHaveCount(1);
  await expect(equip).toContainText('ÉQUIPER LE NOUVEAU');
  await expect(keep).toContainText('GARDER DANS L’INVENTAIRE');
  await expect(recycle).toContainText('RECYCLER');

  // Preview is hypothetical only: opening the comparison must not swap equipment.
  expect(await page.evaluate(({ slot }) => S.equipped && S.equipped[slot] && S.equipped[slot].id, { slot: setup.slot })).toBe(setup.oldId);

  // Keep: new item remains in inventory and current equipment stays untouched.
  await keep.click();
  await expect(panel).toHaveCount(0);
  const kept = await page.evaluate(({ slot, oldId, newId }) => ({
    equippedId: S.equipped && S.equipped[slot] && S.equipped[slot].id,
    newInInventory: (S.inventory || []).some(x => x && x.id === newId),
    oldInInventory: (S.inventory || []).some(x => x && x.id === oldId),
  }), setup);
  expect(kept.equippedId).toBe(setup.oldId);
  expect(kept.newInInventory).toBe(true);

  // Equip the same kept result: the new item replaces the current one and V151
  // guarantees that the previous item returns safely to inventory.
  await page.evaluate(() => showForgeResult([window.__forgeV320.secondResult]));
  await expect(panel).toHaveCount(1);
  await panel.locator('[data-sr-fp146="equip"]').click();
  await expect(panel).toHaveCount(0);
  const equipped = await page.evaluate(({ slot, oldId, newId }) => ({
    equippedId: S.equipped && S.equipped[slot] && S.equipped[slot].id,
    oldInInventory: (S.inventory || []).some(x => x && x.id === oldId),
    newInInventory: (S.inventory || []).some(x => x && x.id === newId),
  }), setup);
  expect(equipped.equippedId).toBe(setup.newId);
  expect(equipped.oldInInventory).toBe(true);
  expect(equipped.newInInventory).toBe(false);

  // Recycle: forge one more item for the same slot and discard only that result.
  const recycleId = await page.evaluate((slot) => {
    for (let i = 0; i < 120; i += 1) {
      const results = forgeSummon(1) || [];
      for (const r of results) {
        if (!r || r.recycled || !r.id) continue;
        const it = (S.inventory || []).find(x => x && x.id === r.id);
        if (it && it.slot === slot) {
          window.__forgeV320Recycle = r;
          showForgeResult([r]);
          return it.id;
        }
      }
    }
    throw new Error('V320 could not forge a recycle candidate for the equipped slot');
  }, setup.slot);

  await expect(panel).toHaveCount(1);
  await expect(panel.locator('[data-sr-fp146="recycle"]')).toHaveCount(1);
  await panel.locator('[data-sr-fp146="recycle"]').click();
  await expect(panel).toHaveCount(0);
  const recycled = await page.evaluate(({ slot, recycleId, equippedId }) => ({
    stillInInventory: (S.inventory || []).some(x => x && x.id === recycleId),
    equippedId: S.equipped && S.equipped[slot] && S.equipped[slot].id,
  }), { slot: setup.slot, recycleId, equippedId: setup.newId });
  expect(recycled.stillInInventory).toBe(false);
  expect(recycled.equippedId).toBe(setup.newId);
});