/* SHADOWREACH · Auto-Forge Compare V182
   Auto-Forge stays fully automatic, but a genuinely stronger kept drop is surfaced
   through the same Forge comparison UI as a manual forge. Bad/neutral drops stay silent.
   The scheduler never stops because a comparison is open, and filter recycling is unchanged. */
(function(){
'use strict';
if(window.__srAutoForgeCompareV182)return;window.__srAutoForgeCompareV182=true;
if(typeof S==='undefined'||!S.forge||typeof forgeSummon!=='function'||typeof showForgeResult!=='function')return;

function itemById(id){
 if(!id)return null;
 var eq=Object.values(S.equipped||{}).find(function(x){return x&&x.id===id;});
 return eq||((S.inventory||[]).find(function(x){return x&&x.id===id;}))||null;
}
function powerDelta(it){
 if(!it||!it.slot||typeof computePower!=='function')return 0;
 try{
  var before=Number(S.power||computePower(S)||0),eq=Object.assign({},S.equipped||{});eq[it.slot]=it;
  return Math.round(computePower(Object.assign({},S,{equipped:eq}))-before);
 }catch(_){return 0;}
}
function isGood(r){
 if(!r||r.recycled||!r.id)return false;
 var it=itemById(r.id);if(!it||!it.slot)return false;
 var cur=(S.equipped||{})[it.slot]||null;
 if(!cur)return true;
 return powerDelta(it)>0;
}

/* Replace only the scheduler body. The Forge roll, filter, costs and mastery remain
   authoritative in forgeSummon(). */
try{
 if(typeof autoForgeTimer!=='undefined'&&autoForgeTimer!==null){clearTimeout(autoForgeTimer);autoForgeTimer=null;}
}catch(_){}

scheduleAutoForge=function(delay){
 if(typeof autoForgeTimer!=='undefined'&&autoForgeTimer!==null)return;
 autoForgeTimer=setTimeout(function(){
  autoForgeTimer=null;
  if(!S.forge.autoForge)return;
  try{
   if(S.minerai>=forgeCost(S.forge.level)){
    var res=forgeSummon(1)||[];
    var good=res.filter(isGood);
    if(good.length)showForgeResult(good);
   }
  }catch(err){console.error('auto-forge comparison tick failed',err);}
  finally{if(S.forge.autoForge)scheduleAutoForge(1500);}
 },Math.max(0,delay==null?1500:delay));
};

/* A save may already have AUTO enabled when the script loads. Restart it on the
   upgraded scheduler immediately, without requiring the player to toggle it off/on. */
if(S.forge.autoForge)scheduleAutoForge(0);
})();