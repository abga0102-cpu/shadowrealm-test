/* SHADOWREACH V327 · Apple retirement + Mega reward recovery
   Apples stay retired. Mega-Boss victory UI no longer mentions Apples.
   Cleared Mega milestones receive a one-time corrective direct payout so
   rewards missed by the previous migration are not lost. */
(function(){'use strict';
if(window.__srAppleRetirementV306)return;window.__srAppleRetirementV306=true;

try{if(typeof megaAppleBaseReward==='function')megaAppleBaseReward=function(){return 0;};}catch(_){ }
try{if(typeof megaAppleFirstClearReward==='function')megaAppleFirstClearReward=function(){return 0;};}catch(_){ }
try{if(typeof petUpgradeCost==='function')petUpgradeCost=function(){return Infinity;};}catch(_){ }
try{if(typeof upgradePet==='function')upgradePet=function(){return false;};}catch(_){ }
try{if(typeof RESOURCE_INFO!=='undefined'&&RESOURCE_INFO&&Object.prototype.hasOwnProperty.call(RESOURCE_INFO,'apples'))delete RESOURCE_INFO.apples;}catch(_){ }

function clean(html){
  html=String(html||'');
  html=html.replace(/<span class="pill"[^>]*>[^<]*(?:🍎|Gain Pommes?)[\s\S]*?<\/span>/gi,'');
  html=html.replace(/La première victoire donne les Pommes et 2× les accélérateurs/gi,'La première victoire donne 2× les accélérateurs');
  html=html.replace(/<div class="mute tiny mt6">Récompense par première victoire[^<]*Pomme[^<]*<\/div>/gi,'');
  html=html.replace(/Première victoire\s*:\s*\+?\s*\d+\s*🍎/gi,'');
  html=html.replace(/Le Familier le plus avancé conserve son niveau, son espèce, son élément et ses Pommes investies\s*;\s*celles des doublons consommés sont remboursées\./gi,'Le Familier utilisé comme noyau conserve son espèce et son élément.');
  return html;
}
function wrap(name){
  try{var fn=eval(name);if(typeof fn!=='function'||fn.__srV327)return;var w=function(){return clean(fn.apply(this,arguments));};w.__srV327=true;w.__srPrevious=fn;eval(name+'=w');}catch(_){ }
}
wrap('scrMegaRaid');wrap('scrFamiliers');

function megaLevel(floor){
  try{if(typeof megaLevelForFloor==='function')return Number(megaLevelForFloor(Number(floor)))||0;}catch(_){ }
  return Math.max(1,Math.floor(Number(floor)/10));
}
function recoverMegaRewards(){
  try{
    if(typeof S==='undefined'||!S||!window.__srMegaRewardsV318)return false;
    if(S.megaRewardRecoveryV327&&S.megaRewardRecoveryV327.done)return false;
    var api=window.__srMegaRewardsV318,seen={},paid=[];
    var clears=S.megaBossClears&&typeof S.megaBossClears==='object'?S.megaBossClears:{};
    Object.keys(clears).forEach(function(f){
      if(!clears[f])return;
      var lv=megaLevel(f),key=String(lv);if(!lv||seen[key])return;seen[key]=true;
      var r=api.reward(lv);if(!r)return;
      var grant=api.grantReward(r,'recovery-v327');if(grant)paid.push(api.rewardText(r));
    });
    S.megaRewardRecoveryV327={done:true,at:Date.now(),count:paid.length};
    if(typeof saveNow==='function')saveNow();
    if(paid.length&&typeof toast==='function')toast('Récompenses Méga récupérées · '+paid.join(' · '),true);
    if(paid.length&&typeof scheduleRender==='function')scheduleRender();
    return paid.length>0;
  }catch(_){return false;}
}
function cleanLive(root){
  try{
    var w=document.createTreeWalker(root||document,NodeFilter.SHOW_TEXT),n,nodes=[];
    while((n=w.nextNode()))nodes.push(n);
    nodes.forEach(function(x){if(/🍎|Pommes?/i.test(x.nodeValue||''))x.nodeValue=(x.nodeValue||'').replace(/Première victoire\s*:\s*\+?\s*\d+\s*🍎/gi,'');});
  }catch(_){ }
}
function bootRecovery(){
  if(typeof S==='undefined'||!S||!window.__srMegaRewardsV318){setTimeout(bootRecovery,120);return;}
  recoverMegaRewards();cleanLive(document);
  try{new MutationObserver(function(ms){ms.forEach(function(m){Array.prototype.forEach.call(m.addedNodes||[],function(n){if(n&&n.nodeType===1)cleanLive(n);});});}).observe(document.body,{childList:true,subtree:true});}catch(_){ }
}

try{if(typeof S!=='undefined'&&S){S.appleSystemRetiredVersion=327;if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srAppleRetirementConfigV306={active:false,megaReward:false,legacyFieldsPreserved:true,conversion:false,recoveryVersion:327};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootRecovery,{once:true});else bootRecovery();
})();
