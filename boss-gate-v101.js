/* SHADOWREACH · manual boss retry gate v106
   Boss defeat => return to previous floor and FARM it normally.
   Boss remains available until cleared. Player decides when to retry.
   Compact challenge control is positioned below the floor header and never blocks combat UI.
*/
(function(){
  'use strict';
  if (window.__srBossGateV106) return;
  window.__srBossGateV106 = true;
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
    var nodes=document.querySelectorAll('.srBossGateCompact');
    for(var i=0;i<nodes.length;i++) nodes[i].remove();
  }
  function gateNode(floor){
    var el=document.createElement('button');
    el.type='button'; el.className='srBossGateCompact'; el.setAttribute('data-sr-boss',String(floor));
    el.innerHTML='<span class="srBossGateIcon">☠</span><span><b>BOSS '+floor+'</b><small>Affronter</small></span>';
    return el;
  }
  function syncGate(){
    if(syncing)return; syncing=true;
    try{
      var world=document.querySelector('.campaignWorld');
      if(!bossGateReady()||!world){removeGate();return;}
      var floor=pendingBoss(), old=document.querySelector('.srBossGateCompact');
      if(old&&old.getAttribute('data-sr-boss')===String(floor)&&old.parentNode===world)return;
      removeGate(); world.appendChild(gateNode(floor));
    }catch(_){}finally{syncing=false;}
  }
  function launchPendingBoss(){
    if(!bossGateReady())return false;
    var floor=pendingBoss();
    try{
      update(function(s){s.floor=floor;s.step=1;});
      removeGate();
      nativeStartCampaign();
      if(typeof saveNow==='function')saveNow();
      if(typeof scheduleRender==='function')scheduleRender();
      return !!combat;
    }catch(_){return false;}
  }
  if(typeof ACT!=='undefined'&&ACT) ACT.challengePendingBoss=function(){
    if(!launchPendingBoss()&&typeof toast==='function')toast('Boss indisponible',false);
  };
  document.addEventListener('click',function(ev){
    var btn=ev.target&&ev.target.closest?ev.target.closest('.srBossGateCompact'):null;
    if(!btn)return; ev.preventDefault();ev.stopPropagation();launchPendingBoss();
  },true);

  handleCombatEnd=function(c){
    var bossLost=false,bossWon=false,bossFloor=0;
    try{
      bossFloor=Number(c&&c.floor||0);
      bossLost=!!(c&&c.ctx!=='raid'&&c.ctx!=='mega'&&c.ctx!=='arenaLive'&&c.boss&&c.status==='lost');
      bossWon=!!(c&&c.ctx!=='raid'&&c.ctx!=='mega'&&c.ctx!=='arenaLive'&&c.boss&&c.status==='won');
    }catch(_){}
    nativeHandleCombatEnd.apply(this,arguments);
    if(bossLost&&bossFloor>1){
      try{
        update(function(s){s.pendingBossFloor=bossFloor;s.floor=bossFloor-1;s.step=1;});
        combat=null;
        if(typeof saveNow==='function')saveNow();
        /* Critical difference from v105: restart the previous floor so it can be farmed. */
        nativeStartCampaign();
      }catch(_){}
    }else if(bossWon){
      try{update(function(s){if(Number(s.pendingBossFloor||0)===bossFloor)s.pendingBossFloor=0;});}catch(_){}
    }
    setTimeout(syncGate,0);
  };

  /* Never block normal farming on the previous floor. The pending Boss is only an optional action. */
  startCampaign=function(){
    var result=nativeStartCampaign.apply(this,arguments);
    setTimeout(syncGate,0);
    return result;
  };

  var style=document.createElement('style');
  style.textContent='.campaignWorld{position:relative}.srBossGateCompact{position:absolute;z-index:22;top:78px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:7px;width:auto;min-width:112px;padding:5px 10px;border-radius:999px;border:1px solid rgba(255,92,92,.8);background:rgba(23,10,15,.88);color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.28);font-family:system-ui;pointer-events:auto;touch-action:manipulation}.srBossGateCompact .srBossGateIcon{font-size:14px}.srBossGateCompact b{display:block;font-size:10px;line-height:1;color:#ff9696;letter-spacing:.4px}.srBossGateCompact small{display:block;margin-top:2px;font-size:8px;line-height:1;color:#f3d9dc;font-weight:800}.srBossGateCompact:active{transform:translateX(-50%) translateY(1px)}';
  document.head.appendChild(style);
  if(typeof MutationObserver!=='undefined')new MutationObserver(syncGate).observe(document.body,{childList:true,subtree:true});
  setInterval(syncGate,700); setTimeout(syncGate,0);
})();