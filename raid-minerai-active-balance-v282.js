/* Shadowreach V323 — Raid Minerai active-play balance
   Design authority:
   - Raid Minerai rewards: 750 at level 1, ramp quickly to 1000 at level 10.
   - From level 11 onward: +10 Minerai per raid level.
   - Minerai Autonomy: 25% of the authoritative current Raid Minerai reward per hour.
   Other raid/autonomy resources and progression rules remain unchanged.
*/
(function(){
  'use strict';
  var MINERAI_AUTONOMY_SHARE = 0.25;
  var EARLY_REWARDS = [750, 780, 810, 840, 870, 900, 930, 960, 980, 1000];

  function mineraiReward(level) {
    var lv = Math.max(1, Math.floor(Number(level) || 1));
    if (lv <= EARLY_REWARDS.length) return EARLY_REWARDS[lv - 1];
    return 1000 + (lv - 10) * 10;
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
      version: 323,
      level1: 750,
      level10: 1000,
      postLevel10PerLevel: 10,
      autonomySharePerHour: MINERAI_AUTONOMY_SHARE
    };
  } catch (_) {}
})();
