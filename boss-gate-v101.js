/* SHADOWREACH · manual boss retry gate v108
   Boss defeat => return to previous floor and farm it normally.
   Boss remains available until cleared. Player decides when to retry.
   The retry control sits directly below the floor label and launches through retryPendingBoss().
*/
(function(){
  'use strict';
  if (window.__srBossGateV108) return;
  window.__srBossGateV108 = true;
  if (typeof startCampaign !== 'function') return;

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
    var nodes = document.querySelectorAll('.srBossGateInline');
    for (var i = 0; i < nodes.length; i++) nodes[i].remove();
  }
  function gateNode(floor){
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'srBossGateInline';
    el.setAttribute('data-sr-boss', String(floor));
    el.innerHTML = '<span>☠</span><b>Boss '+floor+'</b><small>Affronter</small>';
    return el;
  }
  function syncGate(){
    if (syncing) return;
    syncing = true;
    try {
      var tag = document.querySelector('.campaignWorld .floorTag');
      var label = tag && tag.querySelector('#aLabel');
      if (!bossGateReady() || !tag || !label) { removeGate(); return; }
      var floor = pendingBoss();
      var old = tag.querySelector('.srBossGateInline');
      if (old && old.getAttribute('data-sr-boss') === String(floor)) return;
      removeGate();
      var gate = gateNode(floor);
      if (label.nextSibling) tag.insertBefore(gate, label.nextSibling);
      else tag.appendChild(gate);
    } catch (_) {} finally { syncing = false; }
  }
  function launchPendingBoss(){
    if (!bossGateReady()) return false;
    try {
      removeGate();
      var ok = (typeof retryPendingBoss === 'function') ? retryPendingBoss() : false;
      if (!ok) {
        syncGate();
        return false;
      }
      if (typeof saveNow === 'function') saveNow();
      if (typeof scheduleRender === 'function') scheduleRender();
      return !!(combat && combat.boss);
    } catch (_) {
      syncGate();
      return false;
    }
  }

  if (typeof ACT !== 'undefined' && ACT) {
    ACT.challengePendingBoss = function(){
      if (!launchPendingBoss() && typeof toast === 'function') toast('Boss indisponible', false);
    };
  }
  document.addEventListener('click', function(ev){
    var btn = ev.target && ev.target.closest ? ev.target.closest('.srBossGateInline') : null;
    if (!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (!launchPendingBoss() && typeof toast === 'function') toast('Boss indisponible', false);
  }, true);

  /* Keep the base campaign behaviour intact. In particular, after a Boss loss
     the engine already stores pendingBossFloor, steps back one floor and starts
     that floor again, which is exactly the desired farming loop. */
  startCampaign = function(){
    var result = nativeStartCampaign.apply(this, arguments);
    setTimeout(syncGate, 0);
    return result;
  };

  var style = document.createElement('style');
  style.textContent = '.srBossGateInline{position:relative!important;inset:auto!important;transform:none!important;margin:4px auto 5px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;width:max-content!important;min-width:0!important;padding:4px 9px!important;border-radius:999px!important;border:1px solid rgba(255,94,94,.75)!important;background:rgba(24,10,15,.82)!important;color:#fff!important;box-shadow:0 1px 6px rgba(0,0,0,.22)!important;font-family:system-ui!important;line-height:1!important;pointer-events:auto!important;touch-action:manipulation!important}.srBossGateInline>span{font-size:11px!important}.srBossGateInline>b{font-size:9px!important;color:#ff9999!important;letter-spacing:.25px!important}.srBossGateInline>small{font-size:8px!important;color:#f0d9dc!important;font-weight:800!important}.srBossGateInline:active{transform:translateY(1px)!important}';
  document.head.appendChild(style);

  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function(){ syncGate(); }).observe(document.body, {childList:true, subtree:true});
  }
  setInterval(syncGate, 700);
  setTimeout(syncGate, 0);
})();