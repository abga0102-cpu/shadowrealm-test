/* SHADOWREACH · manual boss gate v105
   Finishing the floor before a Boss unlocks the Boss without auto-launching it.
   The gate is injected at DOM level so late home/social rerenders cannot erase it.
*/
(function(){
  'use strict';
  if (window.__srBossGateV105) return;
  window.__srBossGateV105 = true;
  if (typeof handleCombatEnd !== 'function' || typeof startCampaign !== 'function') return;

  var nativeHandleCombatEnd = handleCombatEnd;
  var nativeStartCampaign = startCampaign;
  var syncing = false;

  function pendingBoss(){ return Number(S && S.pendingBossFloor || 0); }
  function bossGateReady(){
    var pending = pendingBoss();
    return !!(pending && S && pending === Number(S.floor || 0) + 1 &&
      typeof isBoss === 'function' && isBoss(pending) &&
      !(S.bossClears && S.bossClears[String(pending)]));
  }

  function removeGate(){
    var old = document.querySelectorAll('.srBossGateCard');
    for (var i=0;i<old.length;i++) old[i].remove();
  }

  function gateHTML(floor){
    var wrap = document.createElement('div');
    wrap.className = 'srBossGateCard';
    wrap.setAttribute('data-sr-boss', String(floor));
    wrap.innerHTML = '<div class="srBossGateKicker">☠ BOSS '+floor+' DISPONIBLE</div>'+
      '<button type="button" class="srBossGateDirectBtn">AFFRONTER</button>'+
      '<div class="srBossGateSub">Tu choisis quand lancer le combat.</div>';
    return wrap;
  }

  function syncGate(){
    if (syncing) return;
    syncing = true;
    try {
      var ready = bossGateReady();
      var world = document.querySelector('.campaignWorld');
      var old = document.querySelector('.srBossGateCard');
      if (!ready || !world || combat) {
        if (old) old.remove();
        return;
      }
      var floor = pendingBoss();
      if (old && old.getAttribute('data-sr-boss') === String(floor) && old.parentNode === world) return;
      removeGate();
      var gate = gateHTML(floor);
      var nav = world.querySelector('.worldNavLayer');
      if (nav) world.insertBefore(gate, nav);
      else world.appendChild(gate);
    } catch (_) {
    } finally {
      syncing = false;
    }
  }

  function launchPendingBoss(){
    if (!bossGateReady()) return false;
    var floor = pendingBoss();
    try {
      update(function(s){
        s.floor = floor;
        s.step = 1;
      });
      removeGate();
      /* Once S.floor equals the Boss floor, bossGateReady() is false. Calling
         the original starter therefore enters the normal campaign pipeline and
         preserves all combat timers/render hooks instead of hand-building combat. */
      nativeStartCampaign();
      if (typeof saveNow === 'function') saveNow();
      if (typeof scheduleRender === 'function') scheduleRender();
      setTimeout(syncGate, 50);
      return !!combat;
    } catch (_) {
      return false;
    }
  }

  if (typeof ACT !== 'undefined' && ACT) {
    ACT.challengePendingBoss = function(){
      if (!launchPendingBoss() && typeof toast === 'function') toast('Boss indisponible', false);
    };
  }

  document.addEventListener('click', function(ev){
    var t = ev.target;
    var btn = t && t.closest ? t.closest('.srBossGateDirectBtn') : null;
    if (!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (!launchPendingBoss() && typeof toast === 'function') toast('Boss indisponible', false);
  }, true);

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
    setTimeout(syncGate, 0);
  };

  startCampaign = function(){
    if (bossGateReady()) {
      combat = null;
      setTimeout(syncGate, 0);
      try { if (typeof scheduleRender === 'function') scheduleRender(); } catch (_) {}
      return;
    }
    var result = nativeStartCampaign.apply(this, arguments);
    setTimeout(syncGate, 0);
    return result;
  };

  var style = document.createElement('style');
  style.textContent = '.campaignWorld{position:relative}.srBossGateCard{position:absolute;z-index:60;top:128px;left:50%;transform:translateX(-50%);width:min(230px,66vw);padding:12px 14px;border-radius:16px;background:rgba(20,7,12,.96);border:1.5px solid #E5484D;box-shadow:0 0 22px rgba(229,72,77,.35);text-align:center;pointer-events:auto}.srBossGateKicker{font:900 12px/1.25 system-ui;color:#FF9292;letter-spacing:.7px}.srBossGateDirectBtn{margin-top:8px;width:100%;padding:11px 10px;border:0;border-radius:11px;background:linear-gradient(#FF665F,#B9212A);color:#fff;font:900 13px system-ui;box-shadow:0 3px 0 #6E141A;touch-action:manipulation}.srBossGateDirectBtn:active{transform:translateY(1px)}.srBossGateSub{margin-top:7px;color:#E1C0C5;font:700 9px/1.25 system-ui}';
  document.head.appendChild(style);

  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function(){ syncGate(); });
    observer.observe(document.body, {childList:true, subtree:true});
  }
  setInterval(syncGate, 500);
  setTimeout(syncGate, 0);
})();
