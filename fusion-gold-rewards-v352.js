/* SHADOWREACH · Fusion milestone Gold rewards authority v357
   Approved Gold ladder.
   Free / Premium: 50=50k/10k, 150=100k/20k, 250=150k/30k,
   350=200k/40k, 500=300k/60k, 1000=600k/120k, 1500=1M/200k.
   V357: removes the global DOM MutationObserver that could create a render loop
   through update() -> scheduleRender() -> DOM mutation -> observer. */
(function(){
'use strict';
if(window.__srFusionGoldRewardsV357)return;
window.__srFusionGoldRewardsV357=true;
window.__srFusionGoldRewardsV355=true;

var LADDER={
 fusion50:{target:50,free:50000,premium:10000,title:'50 Fusions'},
 fusion150:{target:150,free:100000,premium:20000,title:'150 Fusions'},
 fusion250:{target:250,free:150000,premium:30000,title:'250 Fusions'},
 fusion350:{target:350,free:200000,premium:40000,title:'350 Fusions'},
 fusion500:{target:500,free:300000,premium:60000,title:'500 Fusions'},
 fusion1000:{target:1000,free:600000,premium:120000,title:'1 000 Fusions'},
 fusion1500:{target:1500,free:1000000,premium:200000,title:'1 500 Fusions'}
};
var TITLE_TO_ID={};Object.keys(LADDER).forEach(function(id){TITLE_TO_ID[LADDER[id].title]=id;});
var RESET_IDS=['fusion50','fusion150'];

function n(v){return Math.max(0,Math.floor(Number(v)||0));}
function ensure(s){
 if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};
 var a=s.accomplishments;
 if(!a.claimed||typeof a.claimed!=='object')a.claimed={};
 if(!a.premiumClaimed||typeof a.premiumClaimed!=='object')a.premiumClaimed={};
 return a;
}
function count(s){var st=(s&&s.sanctuary)||{},a=(s&&s.accomplishments)||{};return Math.max(n(st.mergeCrafts),n(st.fusions),n(a.fusionCount));}
function premiumOwned(a){return !!(a&&(a.premiumPass||a.premiumPassOwned));}
function fmt(v){return Math.round(Number(v)||0).toLocaleString('fr-FR')+' Or';}
function refresh(id,premium){
 try{if(typeof toast==='function')toast(premium?'Bonus Premium reçu !':'Récompense reçue !',true);}catch(_){}
 try{window.dispatchEvent(new CustomEvent('sr:accomplishmentclaimed',{detail:{id:id,choice:'',premium:!!premium}}));}catch(_){}
 try{if(typeof ACT!=='undefined'&&ACT&&typeof ACT.accomplishments==='function')ACT.accomplishments();}catch(_){}
 setTimeout(patchUI,0);
}
function grantGold(s,amount){s.gold=(Number(s.gold)||0)+amount;}
function claim(id,premium){
 var cfg=LADDER[id];if(!cfg||typeof S==='undefined'||!S||count(S)<cfg.target)return false;
 var a=ensure(S);if(premium){if(!premiumOwned(a)||a.premiumClaimed[id])return false;}else if(a.claimed[id])return false;
 var granted=false;
 if(typeof update==='function'){
  update(function(s){
   var x=ensure(s);if(count(s)<cfg.target)return;
   if(premium){if(!premiumOwned(x)||x.premiumClaimed[id])return;}else if(x.claimed[id])return;
   var st=s.sanctuary||{};x.fusionCount=Math.max(n(x.fusionCount),n(st.mergeCrafts),n(st.fusions));
   grantGold(s,premium?cfg.premium:cfg.free);
   if(premium)x.premiumClaimed[id]=true;else x.claimed[id]=true;
   granted=true;
  });
 }else{
  grantGold(S,premium?cfg.premium:cfg.free);
  a.fusionCount=Math.max(n(a.fusionCount),n(S.sanctuary&&S.sanctuary.mergeCrafts),n(S.sanctuary&&S.sanctuary.fusions));
  if(premium)a.premiumClaimed[id]=true;else a.claimed[id]=true;
  try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}
  granted=true;
 }
 if(granted)refresh(id,premium);return granted;
}

function enforceDesignReset(){
 try{
  if(typeof S==='undefined'||!S)return false;
  var a=S.accomplishments||{},c=a.claimed||{},p=a.premiumClaimed||{};
  var needs=false;
  for(var i=0;i<RESET_IDS.length;i++){
   var id=RESET_IDS[i];
   if(c[id]||p[id]){needs=true;break;}
  }
  if(!needs)return false;
  var changed=false;
  function apply(s){
   var x=ensure(s);
   RESET_IDS.forEach(function(id){
    if(x.claimed[id]){x.claimed[id]=false;changed=true;}
    if(x.premiumClaimed[id]){x.premiumClaimed[id]=false;changed=true;}
   });
  }
  if(typeof update==='function')update(apply);else{apply(S);if(changed){try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}}
  return changed;
 }catch(_){return false;}
}

window.addEventListener('click',function(e){
 var t=e.target&&e.target.closest?e.target.closest('.srAch139 [data-ach-premium],.srAch139 [data-ach]'):null;if(!t)return;
 var premium=t.hasAttribute('data-ach-premium');var id=String(t.getAttribute(premium?'data-ach-premium':'data-ach')||'');if(!LADDER[id])return;
 if(RESET_IDS.indexOf(id)>=0){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();return;}
 e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();claim(id,premium);
},true);

function patchUI(){
 try{
  enforceDesignReset();
  var root=document.querySelector('.srAch139');if(!root)return;
  var rows=root.querySelectorAll('.achPassRow');
  for(var i=0;i<rows.length;i++){
   var row=rows[i],title=row.querySelector('.achObjective b');if(!title)continue;
   var id=TITLE_TO_ID[String(title.textContent||'').trim()];if(!id)continue;
   var rewards=row.querySelectorAll('.achReward'),cfg=LADDER[id];
   if(rewards[0]){var ft=rewards[0].querySelector('.achRewardText');if(ft&&ft.textContent!==fmt(cfg.free))ft.textContent=fmt(cfg.free);}
   if(rewards[1]){var pt=rewards[1].querySelector('.achRewardText');if(pt&&pt.textContent!==fmt(cfg.premium))pt.textContent=fmt(cfg.premium);}
   if(RESET_IDS.indexOf(id)>=0){
    var done=count(S)>=cfg.target;
    if(rewards[0]){var freeState=rewards[0].querySelector('.achState,.btn');if(freeState)freeState.outerHTML=done?'<button class="btn sm" data-ach="'+id+'" data-primary="true">Récupérer</button>':'<span class="achState">En cours</span>';}
    if(rewards[1]){var premState=rewards[1].querySelector('.achState,.btn');if(premState)premState.outerHTML=premiumOwned((S&&S.accomplishments)||{})?(done?'<button class="btn sm" data-ach-premium="'+id+'" data-primary="true">Récupérer</button>':'<span class="achState">En cours</span>'):'<span class="achState locked">Premium</span>';}
   }
  }
 }catch(_){}
}

try{
 enforceDesignReset();
 patchUI();
 document.addEventListener('click',function(e){
  var t=e.target&&e.target.closest?e.target.closest('[data-ach-tab],[data-act="accomplishments"],#srAchArenaLauncher138'):null;
  if(t)setTimeout(patchUI,0);
 },true);
 window.addEventListener('sr:accomplishments-ready',patchUI);
 window.addEventListener('sr:accomplishmentclaimed',function(){setTimeout(patchUI,0);});
 setTimeout(patchUI,100);setTimeout(patchUI,400);setTimeout(patchUI,1000);
}catch(_){}
})();
