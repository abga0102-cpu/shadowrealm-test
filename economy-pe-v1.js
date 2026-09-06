/* Shadowreach · PE economy rebase v5
   Raid Evolution: 100 PE at level 1, then +3 PE per level.
   Existing saves receive the exact +90 PE delta for every provable
   Evolution raid victory, once. */
"use strict";

(() => {
  if (typeof raidReward !== "function") return;

  const previousRaidReward = raidReward;
  raidReward = function raidRewardRebalanced(raid, level) {
    if (raid === "evolution") return 100 + 3 * Math.max(0, level - 1);
    return previousRaidReward(raid, level);
  };

  if (typeof S !== "object" || !S || typeof update !== "function") return;
  if (Object.prototype.hasOwnProperty.call(S, "economyRebaseV5")) return;

  update((st) => {
    if (Object.prototype.hasOwnProperty.call(st, "economyRebaseV5")) return;

    const r = (st.raids && st.raids.evolution) || {};
    const maxLevel = (typeof RULES === "object" && RULES && Number(RULES.RAID_MAX_LEVEL)) || 50;
    const stars = Math.max(0, Number(r.stars) || 0);
    const level = Math.max(1, Math.min(maxLevel, Number(r.level) || 1));
    const record = Math.max(0, Math.min(maxLevel, Number(r.record) || 0));

    // Same conservative proof rule already used by the previous economy rebase:
    // each star proves one complete raid ladder; the current level/record proves
    // only victories that can be reconstructed from the save.
    const provenWins = stars > 0
      ? stars * maxLevel + Math.max(0, level - 1)
      : Math.max(Math.max(0, level - 1), record);

    const bonusPerWin = 90; // (100 + 3n) - (10 + 3n)
    const peCredited = provenWins * bonusPerWin;

    st.pe = Math.max(0, Number(st.pe) || 0) + peCredited;
    st.economyRebaseV5 = true;
    st.economyRebaseNoticeV5 = {
      evolutionWins: provenWins,
      peCredited,
      bonusPerWin,
    };
  });
})();
