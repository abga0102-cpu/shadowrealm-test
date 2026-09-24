/* Shadowreach V444 — Raid Minerai economy compatibility
   Final reward ownership is V396. This earlier-loaded compatibility layer mirrors
   the same curve so no transient/legacy path can restore the old generous values:
   - 500 Minerai at 1-1;
   - +5 per level across the full permanent ladder;
   - 845 Minerai at 7-10 / internal level 70.
   Current Autonomy is owned by harvestRates() and consumes raidReward().
*/
(function(){
  'use strict';
  var MINERAI_AUTONOMY_SHARE = 0.25;

  function mineraiReward(level) {
    var lv = Math.max(1, Math.min(70, Math.floor(Number(level) || 1)));
    return 500 + 5 * (lv - 1);
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
      version: 444,
      level1: 500,
      perLevel: 5,
      level70: 845,
      autonomySharePerHour: MINERAI_AUTONOMY_SHARE
    };
  } catch (_) {}
})();
