/* Shadowreach V471 — Raid Minerai economy compatibility
   Final reward ownership is V396. This earlier-loaded compatibility layer mirrors
   the same curve so no transient/legacy path can restore an older reward table:
   - level 1 = 500 Minerai;
   - +25 per level through level 10 (725);
   - +10 per level through level 50 (1 125);
   - +5 per level after level 50 (1 225 at level 70).
   Current Autonomy is owned by harvestRates() and consumes raidReward().
*/
(function(){
  'use strict';
  var MINERAI_AUTONOMY_SHARE = 0.25;

  function mineraiReward(level) {
    var lv = Math.max(1, Math.min(70, Math.floor(Number(level) || 1)));
    if (lv <= 10) return 500 + 25 * (lv - 1);
    if (lv <= 50) return 725 + 10 * (lv - 10);
    return 1125 + 5 * (lv - 50);
  }

  /* Minerai now owns its explicit V323 reward curve. All other raid reward
     types continue through the existing authoritative implementation. */
  if (typeof raidReward === 'function' && !raidReward.__srV323Minerai) {
    var previousRaidReward = raidReward;
    var wrappedRaidReward = function(type, level) {
      if (type === 'minerai') return mineraiReward(level);
      return previousRaidReward.apply(this, arguments);
    };
    wrappedRaidReward.__srV323Minerai = true;
    wrappedRaidReward.__srPrevious = previousRaidReward;
    raidReward = wrappedRaidReward;
  }

  /* Rebuild Minerai autonomy from the same authoritative reward curve.
     Other resources retain their existing rules. PE remains absent. */
  if (typeof harvestPerHour === 'function' && !harvestPerHour.__srV323Minerai) {
    var previousHarvestPerHour = harvestPerHour;
    var wrappedHarvestPerHour = function(s) {
      var out = previousHarvestPerHour.apply(this, arguments) || {};
      try {
        var eff = (typeof harvestEfficiency === 'function') ? harvestEfficiency(s) / 100 : 0;
        if (eff > 0 && s && s.raids && s.raids.minerai) {
          out.minerai = raidReward('minerai', s.raids.minerai.level) * MINERAI_AUTONOMY_SHARE * eff;
        } else if (Object.prototype.hasOwnProperty.call(out, 'minerai')) {
          out.minerai = 0;
        }
      } catch (_) {}
      return out;
    };
    wrappedHarvestPerHour.__srV323Minerai = true;
    wrappedHarvestPerHour.__srPrevious = previousHarvestPerHour;
    harvestPerHour = wrappedHarvestPerHour;
  }

  try {
    window.__shadowreachRaidMineraiBalance = {
      version: 471,
      level1: 500,
      perLevelTo10: 25,
      level10: 725,
      perLevelTo50: 10,
      level50: 1125,
      perLevelAfter50: 5,
      level70: 1225,
      autonomySharePerHour: MINERAI_AUTONOMY_SHARE
    };
  } catch (_) {}
})();
