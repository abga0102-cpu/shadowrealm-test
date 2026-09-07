/* SHADOWREACH · manual boss gate v104
   Rule: clearing the floor before a Boss unlocks the Boss, but never launches it automatically.
   The player chooses when to enter. Boss failure returns to the previous floor with the Boss still available.
*/
(function(){
  'use strict';
  if (window.__srBossGateV104) return;
  window.__srBossGateV104 = true;
  if (typeof handleCombatEnd !== 'function' || typeof startCampaign !== 'function') return;

  var nativeHandleCombatEnd = handleCombatEnd;
  var nativeStartCampaign = startCampaign;
  var nativeScrAccueil = (typeof scrAccueil === 'function') ? scrAccueil : null;

  function pendingBoss(){ return Number(S && S.pendingBossFloor || 0); }
  function bossGateReady(){
    var pending = pendingBoss();
    return !!(pending && S && pending === Number(S.floor || 0) + 1 &&
      typeof isBoss === 'function' && isBoss(pending) &&
      !(S.bossClears && S.bossClears[String(pending)]));
  }

  function launchPendingBoss(){
    if (!bossGateReady()) return false;
    var floor = pendingBoss();
    try {
      if (typeof retryPendingBoss === 'function' && retryPendingBoss()) {
        if (typeof saveNow === 'function') saveNow();
        if (typeof scheduleRender === 'function') scheduleRender();
        return true;
      }
    } catch (_) {}
    try {
      update(function(s){ s.floor = floor; s.step = 1; });
      combat = (typeof spawnCampaign === 'function') ? spawnCampaign(S) : null;
      if (typeof saveNow === 'function') saveNow();
      if (typeof scheduleRender === 'function') scheduleRender();
      return !!combat;
    } catch (_) { return false; }
  }

  if (typeof ACT !== 'undefined' && ACT) {
    ACT.challengePendingBoss = function(){
      if (!launchPendingBoss() && typeof toast === 'function') toast('Boss indisponible', false);
    };
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

  if (nativeScrAccueil) {
    scrAccueil = function(){
      var html = nativeScrAccueil.apply(this, arguments);
      if (!bossGateReady()) return html;
      var floor = pendingBoss();
      var gate = '<div class="srBossGateCard">' +
        '<div class="srBossGateKicker">☠ BOSS ' + floor + ' DISPONIBLE</div>' +
        '<button class="srBossGateBtn" data-act="challengePendingBoss">AFFRONTER</button>' +
        '<div class="srBossGateSub">Tu choisis quand lancer le combat.</div>' +
      '</div>';
      var marker = '<div class="worldNavLayer">';
      if (String(html).indexOf(marker) >= 0) return String(html).replace(marker, gate + marker);
      return gate + html;
    };
  }

  var style = document.createElement('style');
  style.textContent = '.campaignWorld{position:relative}.srBossGateCard{position:absolute;z-index:18;top:118px;right:14px;width:154px;padding:10px;border-radius:14px;background:rgba(20,7,12,.93);border:1px solid #E5484D;box-shadow:0 0 18px rgba(229,72,77,.28);text-align:center}.srBossGateKicker{font:900 11px/1.2 system-ui;color:#FF8A8A;letter-spacing:.6px}.srBossGateBtn{margin-top:7px;width:100%;padding:9px 8px;border:0;border-radius:10px;background:linear-gradient(#FF665F,#B9212A);color:white;font:900 12px system-ui;box-shadow:0 3px 0 #6E141A}.srBossGateSub{margin-top:6px;color:#D8B9BE;font:700 8px/1.25 system-ui}.srBossGateBtn:active{transform:translateY(1px)}';
  document.head.appendChild(style);

  try {
    if (bossGateReady()) {
      combat = null;
      if (typeof saveNow === 'function') saveNow();
      if (typeof scheduleRender === 'function') scheduleRender();
    }
  } catch (_) {}
})();
