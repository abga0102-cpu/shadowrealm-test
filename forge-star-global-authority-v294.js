/* SHADOWREACH V294 · Forge star global authority
   Additive QA fix: Forge 1★ already doubles produced equipment through V283,
   but the permanent Forge level bonus was still using the 0★ curve.
   0★: +2% DGT / +1% PV per Forge level.
   1★: +4% DGT / +2% PV per Forge level.
   V310 safety hardening: computeDerived now evaluates a shallow derived-state
   copy with the effective Forge level instead of mutating the supplied state.
   Save values, economy and approved multipliers remain unchanged. */
(function(){
'use strict';
if(window.__srForgeStarGlobalV294)return;window.__srForgeStarGlobalV294=true;

function forgeStar(s){try{return Math.max(0,Math.floor(starsOf(s,'forge')||0));}catch(_){return 0;}}
function effectiveForgeLevel(s){var lv=Math.max(0,Number(s&&s.forge&&s.forge.level)||0);return forgeStar(s)>=1?lv*2:lv;}
function derivedForgeState(s){
  if(!s||!s.forge||forgeStar(s)<1)return s;
  var copy=Object.assign({},s);
  copy.forge=Object.assign({},s.forge,{level:effectiveForgeLevel(s)});
  return copy;
}

try{
  if(typeof computeDerived==='function'&&!computeDerived.__srV294){
    var old=computeDerived;
    computeDerived=function(s){return old(derivedForgeState(s));};
    computeDerived.__srV294=true;
  }
}catch(_){ }
try{if(typeof computePower==='function')computePower=function(s){return computeDerived(s)._power||0;};}catch(_){ }
try{
  if(typeof S!=='undefined'&&S){
    S.forgeStarGlobalVersion=294;
    if(typeof computePower==='function')S.power=computePower(S);
    if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);
    if(typeof saveNow==='function')saveNow();
    if(typeof scheduleRender==='function')scheduleRender();
  }
}catch(_){ }
window.__srForgeStarGlobalConfigV294={damagePerLevel0:2,hpPerLevel0:1,damagePerLevel1:4,hpPerLevel1:2,effectiveForgeLevel:effectiveForgeLevel,stateIsolated:true};
})();

/* SHADOWREACH V449 · Forge lifetime mastery extension + Dust rank rewards.
   Canonical V445 equipment math is preserved; only the lifetime thresholds move.
   Existing saves are grandfathered without retroactive Dust to avoid an economy
   windfall. Future rank crossings grant 50 Dust per rank number exactly once. */
(function(){
'use strict';
if(window.__srForgeMasteryV449)return;
var oldApi=window.__srForgeLifetimeMasteryV445;
if(!oldApi||typeof oldApi.rawStats!=='function'||typeof oldApi.statsFor!=='function')return;
var TIERS=[
 {need:0,rank:0,roman:'—',bonusPct:0,reward:0},
 {need:100,rank:1,roman:'I',bonusPct:10,reward:50},
 {need:500,rank:2,roman:'II',bonusPct:20,reward:100},
 {need:1500,rank:3,roman:'III',bonusPct:30,reward:150},
 {need:3000,rank:4,roman:'IV',bonusPct:40,reward:200},
 {need:5000,rank:5,roman:'V',bonusPct:50,reward:250},
 {need:8000,rank:6,roman:'VI',bonusPct:60,reward:300},
 {need:12000,rank:7,roman:'VII',bonusPct:70,reward:350},
 {need:20000,rank:8,roman:'VIII',bonusPct:75,reward:400},
 {need:30000,rank:9,roman:'IX',bonusPct:80,reward:450}
];
function info(s){
 var count=Math.max(0,Math.floor(Number(s&&s.forge&&s.forge.lifetimeCount)||0)),cur=TIERS[0],next=null;
 for(var i=1;i<TIERS.length;i++){if(count>=TIERS[i].need)cur=TIERS[i];else{next=TIERS[i];break;}}
 var pct=100;if(next){var span=Math.max(1,next.need-cur.need);pct=Math.max(0,Math.min(100,(count-cur.need)/span*100));}
 return {count:count,rank:cur.rank,roman:cur.roman,bonusPct:cur.bonusPct,currentNeed:cur.need,nextNeed:next?next.need:null,nextRoman:next?next.roman:null,nextReward:next?next.reward:0,reward:cur.reward,progressPct:pct,maxed:!next};
}
function quality(it){var q=Number(it&&it.statQuality);return q>0&&q<=1?q:null;}
function applyItem(it,s){
 if(!it||!it.rarity)return false;var q=quality(it);if(q==null)return oldApi.applyItem(it,s);
 var oldBD=Number(it.baseDamage)||0,oldBH=Number(it.baseHp)||0,oldD=Number(it.damage)||0,oldH=Number(it.hp)||0;
 var df=oldBD>0?Math.max(1,oldD/oldBD):1,hf=oldBH>0?Math.max(1,oldH/oldBH):1,pct=info(s).bonusPct,star=1;
 try{star=Number(starMul(s,'forge'))||1;}catch(_){}
 var x=oldApi.statsFor(it.slot,it.rarity,q,star,pct);
 it.baseDamage=x.d;it.baseHp=x.h;it.damage=Math.round(x.d*df*100)/100;it.hp=Math.round(x.h*hf*100)/100;
 it.originalPower=x.rawD+x.rawH;it.power=it.damage+it.hp;it.forgeLifetimeMasteryPct=pct;it.forgeLifetimeMasteryVersion=449;return true;
}
function applyState(s){
 if(!s||!s.forge)return {changed:false,info:info(s)};var changed=false;
 (s.inventory||[]).forEach(function(it){if(applyItem(it,s))changed=true;});
 if(s.equipped)Object.keys(s.equipped).forEach(function(k){if(applyItem(s.equipped[k],s))changed=true;});
 s.forge.lifetimeMasteryVersion=449;return {changed:changed,info:info(s)};
}
function ensureClaimState(s){
 if(!s||!s.forge)return;var current=info(s).rank;
 if(!Number.isFinite(Number(s.forge.masteryDustClaimedRank)))s.forge.masteryDustClaimedRank=current;
 s.forge.masteryDustClaimedRank=Math.max(0,Math.min(9,Math.floor(Number(s.forge.masteryDustClaimedRank)||0)));
}
function showReward(rank,reward,total){
 try{
  var old=document.getElementById('srForgeMasteryReward449');if(old)old.remove();
  var d=document.createElement('div');d.id='srForgeMasteryReward449';d.innerHTML='<div class="srFMGlow449"></div><div class="srFMCrown449">✦</div><b>MAÎTRISE '+TIERS[rank].roman+' ATTEINTE</b><strong>+'+total+' POUSSIÈRES</strong><small>'+(total===reward?'Récompense de rang':'Plusieurs rangs franchis')+'</small>';
  document.body.appendChild(d);setTimeout(function(){d.classList.add('out');},1800);setTimeout(function(){if(d.parentNode)d.remove();},2350);
 }catch(_){}
}
function grantCrossed(s,beforeRank){
 ensureClaimState(s);var now=info(s).rank,claimed=Math.max(Number(s.forge.masteryDustClaimedRank)||0,beforeRank||0);if(now<=claimed)return 0;
 var total=0,last=claimed;for(var r=claimed+1;r<=now;r++){total+=TIERS[r].reward;last=r;}
 s.poussiere=Math.max(0,Number(s.poussiere)||0)+total;s.forge.masteryDustClaimedRank=last;
 showReward(now,TIERS[now].reward,total);return total;
}
var api={version:449,tiers:TIERS.map(function(t){return Object.assign({},t);}),info:info,bonusPct:function(s){return info(s).bonusPct;},rawStats:oldApi.rawStats,statsFor:oldApi.statsFor,applyItem:applyItem,applyState:applyState};
window.__srForgeLifetimeMasteryV445=api;window.__srForgeMasteryV449=api;
try{
 if(typeof S!=='undefined'&&S){ensureClaimState(S);applyState(S);if(typeof computePower==='function')S.power=computePower(S);if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);if(typeof saveNow==='function')saveNow();}
}catch(_){}
try{
 if(typeof forgeSummon==='function'&&!forgeSummon.__srV449){var oldForgeSummon=forgeSummon;forgeSummon=function(n){var before=info(S).rank,r=oldForgeSummon.apply(this,arguments);applyState(S);grantCrossed(S,before);if(typeof computePower==='function')S.power=computePower(S);if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);if(typeof saveNow==='function')saveNow();return r;};forgeSummon.__srV449=true;}
}catch(_){}
function decorate(){try{var box=document.querySelector('.srForgeLifetime445');if(!box)return;var m=info(S),meta=box.querySelector('.srForgeLifetimeMeta445');if(meta&&!meta.querySelector('.srFMNext449')&&!m.maxed){var x=document.createElement('span');x.className='srFMNext449';x.textContent='Prochain rang : +'+m.nextReward+' poussières';meta.appendChild(x);}}catch(_){}}
try{new MutationObserver(decorate).observe(document.documentElement,{childList:true,subtree:true});decorate();}catch(_){}
var st=document.createElement('style');st.textContent='#srForgeMasteryReward449{position:fixed;z-index:999999;left:50%;top:42%;transform:translate(-50%,-50%) scale(.7);width:min(86vw,390px);padding:24px 18px;text-align:center;border:2px solid #f5c542;border-radius:18px;background:radial-gradient(circle at 50% 20%,#4b3919 0,#17121f 48%,#090d17 100%);box-shadow:0 0 55px #f5c54299,0 18px 60px #000d;color:#fff;animation:srFMIn449 .38s cubic-bezier(.2,1.5,.4,1) forwards;pointer-events:none;overflow:hidden}#srForgeMasteryReward449 b,#srForgeMasteryReward449 strong,#srForgeMasteryReward449 small{display:block;position:relative;z-index:2}#srForgeMasteryReward449 b{font:900 20px Georgia,serif;color:#ffe89a;letter-spacing:1px;text-shadow:0 0 16px #f5c542}#srForgeMasteryReward449 strong{margin-top:10px;font:1000 24px system-ui;color:#9ef2f8;text-shadow:0 0 18px #43ddec}#srForgeMasteryReward449 small{margin-top:6px;color:#c9d3e4;font:800 11px system-ui}.srFMCrown449{font-size:34px;color:#fff0a6;filter:drop-shadow(0 0 12px #f5c542);animation:srFMPulse449 .7s ease-in-out infinite alternate}.srFMGlow449{position:absolute;inset:-70%;background:conic-gradient(transparent,#f5c54233,transparent,#72eaf633,transparent);animation:srFMSpin449 2s linear infinite}.srFMNext449{color:#9ef2f8!important;margin-left:auto;font-weight:900!important}@keyframes srFMIn449{to{transform:translate(-50%,-50%) scale(1)}}@keyframes srFMPulse449{to{transform:scale(1.22)}}@keyframes srFMSpin449{to{transform:rotate(360deg)}}#srForgeMasteryReward449.out{opacity:0;transform:translate(-50%,-55%) scale(.96);transition:.5s ease}';document.head.appendChild(st);
})();
