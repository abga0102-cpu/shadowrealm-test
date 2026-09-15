/* SHADOWREACH V327 · Mega Boss reward recovery
   Removes the retired Apple line from Mega-Boss victory UI and performs a
   one-time corrective payout for Mega milestones already cleared before this
   fix. Future first clears remain handled by the V318 Mega reward authority. */
(function(){
  'use strict';
  if(window.__srMegaRewardRecoveryV327)return;
  window.__srMegaRewardRecoveryV327=true;

  function levelForFloor(floor){
    if(typeof megaLevelForFloor==='function')return Number(megaLevelForFloor(Number(floor)))||0;
    return Math.max(1,Math.floor(Number(floor)/10));
  }

  function clearedLevels(){
    var out={},clears=(typeof S!=='undefined'&&S&&S.megaBossClears)||{};
    Object.keys(clears).forEach(function(f){
      if(!clears[f])return;
      var lv=levelForFloor(f);
      if(lv>0)out[String(lv)]=true;
    });
    return Object.keys(out).map(Number).sort(function(a,b){return a-b;});
  }

  function recover(){
    if(typeof S==='undefined'||!S||!window.__srMegaRewardsV318)return false;
    S.megaRewardRecoveryV327=S.megaRewardRecoveryV327||{paid:{}};
    var paid=S.megaRewardRecoveryV327.paid||{};
    var api=window.__srMegaRewardsV318,total=0,labels=[];
    clearedLevels().forEach(function(level){
      var key=String(level);
      if(paid[key])return;
      var r=api.reward(level);
      if(!r)return;
      var grant=api.grantReward(r,'recovery-v327');
      if(!grant)return;
      paid[key]=true;total++;
      labels.push(api.rewardText(r));
    });
    S.megaRewardRecoveryV327.paid=paid;
    S.megaRewardRecoveryV327.done=true;
    S.megaRewardRecoveryV327.at=Date.now();
    if(typeof saveNow==='function')saveNow();
    if(total&&typeof toast==='function')toast('Récompenses Méga récupérées · '+labels.join(' · '),true);
    if(total&&typeof scheduleRender==='function')scheduleRender();
    return total>0;
  }

  function cleanAppleCopy(root){
    root=root||document;
    try{
      var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      var nodes=[],n;
      while((n=walker.nextNode()))nodes.push(n);
      nodes.forEach(function(node){
        var t=String(node.nodeValue||'');
        if(!/🍎|Pommes?/i.test(t))return;
        t=t.replace(/Première victoire\s*:\s*\+?\s*0\s*🍎/gi,'')
           .replace(/Première victoire\s*:\s*\+?\s*\d+\s*🍎/gi,'')
           .replace(/Récompense par première victoire[^\n]*/gi,'');
        node.nodeValue=t;
      });
    }catch(_){ }
  }

  function boot(){
    if(typeof S==='undefined'||!S||!window.__srMegaRewardsV318){setTimeout(boot,120);return;}
    recover();cleanAppleCopy(document);
    try{
      new MutationObserver(function(ms){ms.forEach(function(m){
        Array.prototype.forEach.call(m.addedNodes||[],function(n){if(n&&n.nodeType===1)cleanAppleCopy(n);});
      });}).observe(document.body,{childList:true,subtree:true});
    }catch(_){ }
  }

  window.__srMegaRewardRecoveryConfigV327={oneTimeRecovery:true,appleCopyRemoved:true};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
