/* SHADOWREACH · manual boss gate v101
   Rule: clearing the floor before a Boss unlocks the Boss, but never launches it automatically.
   The player chooses when to enter. Boss failure returns to the previous floor with the Boss still available.
*/
(function(){
  'use strict';
  if (window.__srBossGateV101) return;
  window.__srBossGateV101 = true;
  if (typeof handleCombatEnd !== 'function' || typeof startCampaign !== 'function') return;

  var nativeHandleCombatEnd = handleCombatEnd;
  var nativeStartCampaign = startCampaign;

  function bossGateReady(){
    var pending = Number(S && S.pendingBossFloor || 0);
    return !!(pending && S && pending === Number(S.floor || 0) + 1 &&
      typeof isBoss === 'function' && isBoss(pending) &&
      !(S.bossClears && S.bossClears[String(pending)]));
  }

  handleCombatEnd = function(c){
    var shouldOpenGate = false;
    var clearedFloor = 0;
    var bossFloor = 0;

    try {
      if (c && c.ctx !== 'raid' && c.ctx !== 'mega' && c.ctx !== 'arenaLive' &&
          c.status === 'won' && !c.boss && typeof campaignWaveCount === 'function' &&
          Number(c.step || 1) >= Number(campaignWaveCount(c.floor) || 1)) {
        clearedFloor = Number(c.floor || 0);
        bossFloor = clearedFloor + 1;
        shouldOpenGate = typeof isBoss === 'function' && isBoss(bossFloor) &&
          !(S.bossClears && S.bossClears[String(bossFloor)]);
      }
    } catch (_) {}

    nativeHandleCombatEnd.apply(this, arguments);

    if (shouldOpenGate) {
      try {
        update(function(s){
          s.pendingBossFloor = bossFloor;
          s.floor = clearedFloor;
          s.step = 1;
          s.recordFloor = Math.max(Number(s.recordFloor || 1), clearedFloor);
        });
        combat = null;
        if (typeof saveNow === 'function') saveNow();
      } catch (_) {}
    }
  };

  startCampaign = function(){
    if (bossGateReady()) {
      combat = null;
      try { if (typeof scheduleRender === 'function') scheduleRender(); } catch (_) {}
      return;
    }
    return nativeStartCampaign.apply(this, arguments);
  };

  /* Repair saves currently stuck one floor before a pending Boss. */
  try {
    if (bossGateReady()) {
      combat = null;
      if (typeof scheduleRender === 'function') scheduleRender();
    }
  } catch (_) {}
})();
