/* Shadowreach V282 — Raid Minerai active-play balance
   Design authority:
   - Raid Minerai rewards: x1.60 versus the current live reward curve.
   - Minerai Autonomy: 25% of the resulting current Raid Minerai reward per hour.
   This deliberately moves value from passive income toward active raids while
   preserving all other raid/autonomy resources and progression rules.
*/
(function(){
  'use strict';
  var RAID_MUL = 1.60;
  var MINERAI_AUTONOMY_SHARE = 0.25;

  /* raidReward is a top-level function in the game core. Preserve the exact
     live curve (levels, stars/Ascension, future callers), changing Minerai only. */
  if (typeof raidReward === 'function' && !raidReward.__srV282) {
    var previousRaidReward = raidReward;
    var wrappedRaidReward = function(type, level) {
      var value = previousRaidReward.apply(this, arguments);
      if (type !== 'minerai') return value;
      return Math.round((Number(value) || 0) * RAID_MUL);
    };
    wrappedRaidReward.__srV282 = true;
    wrappedRaidReward.__srPrevious = previousRaidReward;
    raidReward = wrappedRaidReward;
  }

  /* Rebuild the autonomy rate from the authoritative current raid reward.
     Other resources retain their existing 25% rules. PE remains absent. */
  if (typeof harvestPerHour === 'function' && !harvestPerHour.__srV282) {
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
    wrappedHarvestPerHour.__srV282 = true;
    wrappedHarvestPerHour.__srPrevious = previousHarvestPerHour;
    harvestPerHour = wrappedHarvestPerHour;
  }

  try {
    window.__shadowreachRaidMineraiBalance = {
      version: 282,
      raidMultiplier: RAID_MUL,
      autonomySharePerHour: MINERAI_AUTONOMY_SHARE
    };
  } catch (_) {}
})();
