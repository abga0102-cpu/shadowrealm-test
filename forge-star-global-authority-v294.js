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
