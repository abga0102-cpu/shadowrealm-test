/* SHADOWREACH · manual boss retry gate v109
   Boss defeat => return to previous floor and farm it normally.
   Boss remains available until cleared. Player decides when to retry.
   Retry control is placed BELOW the floor progression + wave/enemy counters.
*/
(function(){
  'use strict';
  if (window.__srBossGateV109) return;
  window.__srBossGateV109 = true;
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
    var nodes = document.querySelectorAll('.srBossGateBelow');
    for (var i = 0; i < nodes.length; i++) nodes[i].remove();
  }
  function gateNode(floor){
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'srBossGateBelow';
    el.setAttribute('data-sr-boss', String(floor));
    el.innerHTML = '<span class="srBossGateSkull">☠</span><b>Boss '+floor+'</b><small>Affronter</small><span class="srBossGateArrow">›</span>';
    return el;
  }
  function syncGate(){
    if (syncing) return;
    syncing = true;
    try {
      var tag = document.querySelector('.campaignWorld .floorTag');
      var sub = tag && tag.querySelector('#aSub');
      if (!bossGateReady() || !tag || !sub) { removeGate(); return; }
      var floor = pendingBoss();
      var old = tag.querySelector('.srBossGateBelow');
      if (old && old.getAttribute('data-sr-boss') === String(floor) && old.previousSibling === sub) return;
      removeGate();
      var gate = gateNode(floor);
      if (sub.nextSibling) tag.insertBefore(gate, sub.nextSibling);
      else tag.appendChild(gate);
    } catch (_) {} finally { syncing = false; }
  }
  function launchPendingBoss(){
    if (!bossGateReady()) return false;
    try {
      var ok = (typeof retryPendingBoss === 'function') ? retryPendingBoss() : false;
      if (!ok) { syncGate(); return false; }
      removeGate();
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
    var btn = ev.target && ev.target.closest ? ev.target.closest('.srBossGateBelow') : null;
    if (!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (!launchPendingBoss() && typeof toast === 'function') toast('Boss indisponible', false);
  }, true);

  /* Keep base campaign farming untouched. Boss loss already returns to the
     previous floor; retryPendingBoss() is the only entry path back into Boss. */
  startCampaign = function(){
    var result = nativeStartCampaign.apply(this, arguments);
    setTimeout(syncGate, 0);
    return result;
  };

  var style = document.createElement('style');
  style.textContent = '.srBossGateBelow{position:relative!important;inset:auto!important;transform:none!important;margin:7px auto 0!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;width:max-content!important;min-width:145px!important;padding:5px 11px!important;border-radius:999px!important;border:1px solid rgba(255,91,91,.78)!important;background:rgba(23,10,15,.88)!important;color:#fff!important;box-shadow:0 1px 7px rgba(0,0,0,.25)!important;font-family:system-ui!important;line-height:1!important;pointer-events:auto!important;touch-action:manipulation!important}.srBossGateBelow .srBossGateSkull{font-size:12px!important}.srBossGateBelow>b{font-size:9.5px!important;color:#ff8f8f!important;letter-spacing:.25px!important}.srBossGateBelow>small{font-size:8.5px!important;color:#f1dfe2!important;font-weight:800!important}.srBossGateBelow .srBossGateArrow{margin-left:2px;font-size:14px!important;color:#91a0bf!important;font-weight:900!important}.srBossGateBelow:active{transform:translateY(1px)!important}';
  document.head.appendChild(style);

  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function(){ syncGate(); }).observe(document.body, {childList:true, subtree:true});
  }
  setInterval(syncGate, 700);
  setTimeout(syncGate, 0);
})();