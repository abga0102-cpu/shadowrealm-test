/* V451 · New Forge drops inherit the permanent Equipment Mastery rank.
   The inherited rank is a starting level, not a Dust upgrade: upgradeBaseLevel
   is anchored to the same value so existing mastery/base-stat bonuses are not
   counted twice. Existing equipment is never rewritten. */
(function () {
  "use strict";

  if (typeof forgeSummon !== "function" || typeof makeItem !== "function") return;
  if (window.__srForgeDropMasteryLevelV451) return;

  const originalForgeSummon = forgeSummon;
  const originalMakeItem = makeItem;

  function currentMasteryRank() {
    const api = window.__srForgeLifetimeMasteryV445;
    const state = typeof S !== "undefined" ? S : null;
    if (!api || typeof api.info !== "function" || !state) return 0;
    const info = api.info(state) || {};
    return Math.max(0, Math.floor(Number(info.rank) || 0));
  }

  function makeForgedItemAtMasteryRank() {
    const item = originalMakeItem.apply(this, arguments);
    if (!item || typeof item !== "object") return item;
    const rank = currentMasteryRank();
    if (rank > 0) {
      item.level = rank;
      item.upgradeBaseLevel = rank;
    }
    return item;
  }

  forgeSummon = function forgeSummonV451(n) {
    const previousMakeItem = makeItem;
    makeItem = makeForgedItemAtMasteryRank;
    try {
      return originalForgeSummon.call(this, n);
    } finally {
      makeItem = previousMakeItem;
    }
  };

  window.__srForgeDropMasteryLevelV451 = {
    version: 451,
    currentMasteryRank,
    inheritedLevel: currentMasteryRank
  };
})();
