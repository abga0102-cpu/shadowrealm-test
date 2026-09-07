/* RAID_INTRO_BALANCE_V107
   Additive balance patch.
   Only raid levels 1-5 are softened for new players. Level 6+ stays at the
   historical multiplier 1, so every later raid level is exactly unchanged. */
(function(){
  if (typeof raidIntroDifficultyMul !== 'function') return;
  raidIntroDifficultyMul = function(raid, level) {
    level = Math.max(1, Number(level) || 1);
    if (level === 1) return 0.45;
    if (level === 2) return 0.55;
    if (level === 3) return 0.68;
    if (level === 4) return 0.82;
    if (level === 5) return 0.92;
    return 1;
  };
})();
