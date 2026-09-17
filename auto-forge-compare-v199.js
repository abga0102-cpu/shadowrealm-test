/* SHADOWREACH · Auto-Forge Compare V199 / V348 dust authority
   AUTO follows the Forge filter only: every kept result is surfaced for comparison.
   Canonical persisted batch sizes are 1/3/5/10, matching the Forge progression gate.
   V348: every filtered AUTO cycle settles recycled Dust against the balance before
   the cycle, persists the result immediately, and shows the exact Dust gain.
*/
(function(){
'use strict';
if(window.__srAutoForgeCompareV199)return;window.__srAutoForgeCompareV199=true;
if(typeof S==='undefined'||!S.forge||typeof forgeSummon!=='function'||typeof showForgeResult!=='function')return;

var pausedForCompare=false;
var VALID_BATCH=[1,3,5,10];
function autoBatch(){var n=Math.floor(Number(S.forge.autoBatch)||1);return VALID_BATCH.indexOf(n)>=0?n:1;}
function isWanted(r){return !!(r&&!r.recycled&&r.id);}
function recycledDustValue(r){
 if(!r||!r.recycled)return 0;
 var direct=Math.max(0,Math.floor(Number(r.dust)||0));
 if(direct>0)return direct;
 try{
  var cfg=window.__srDustEconomyConfigV293;
  var map=cfg&&cfg.byRarity;
  var n=map&&Number(map[r.rarity]);
  if(isFinite(n)&&n>0){r.dust=Math.floor(n);return Math.floor(n);}
 }catch(_){}
 try{
  if(typeof dustValue==='function'&&r.rarity){
   var fallback=Math.max(0,Math.floor(Number(dustValue(S,{rarity:r.rarity,power:r.power||0,originalPower:r.power||0}))||0));
   if(fallback>0){r.dust=fallback;return fallback;}
  }
 }catch(_){}
 return 0;
}
function expectedAutoDust(res){
 if(!Array.isArray(res)||!res.length)return 0;
 return res.reduce(function(sum,r){return sum+recycledDustValue(r);},0);
}
function ensureAutoDust(res,before){
 var expected=expectedAutoDust(res);
 if(!expected)return 0;
 var credited=Math.max(0,(Number(S.poussiere)||0)-(Number(before)||0));
 var missing=Math.max(0,expected-credited);
 if(!missing)return 0;
 try{
  if(typeof update==='function')update(function(st){st.poussiere=(Number(st.poussiere)||0)+missing;});
  else {S.poussiere=(Number(S.poussiere)||0)+missing;if(typeof scheduleRender==='function')scheduleRender();}
 }catch(_){return 0;}
 return missing;
}
function settleAutoDust(res,before,notify){
 var expected=expectedAutoDust(res);
 if(!expected)return 0;
 var missing=ensureAutoDust(res,before);
 try{if(typeof saveNow==='function')saveNow();}catch(_){}
 try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){}
 if(notify){
  var count=res.filter(function(r){return !!(r&&r.recycled);}).length;
  try{if(typeof toast==='function')toast('Auto-Forge · '+count+' pièce'+(count>1?'s':'')+' recyclée'+(count>1?'s':'')+' · +'+(typeof fmt==='function'?fmt(expected):expected)+' poussière',true);}catch(_){}
 }
 return missing;
}
function resume(){
 if(!pausedForCompare)return;
 pausedForCompare=false;
 if(S.forge.autoForge) scheduleAutoForge(1500);
}
window.__srResumeAutoForgeV199=resume;
window.__srAutoForgePausedForCompareV199=function(){return pausedForCompare;};
window.__srAutoForgeDustV346={version:346,ensure:ensureAutoDust,value:recycledDustValue};
window.__srAutoForgeDustV348={version:348,ensure:ensureAutoDust,settle:settleAutoDust,value:recycledDustValue};

try{if(typeof autoForgeTimer!=='undefined'&&autoForgeTimer!==null){clearTimeout(autoForgeTimer);autoForgeTimer=null;}}catch(_){}

scheduleAutoForge=function(delay){
 if(pausedForCompare)return;
 if(typeof autoForgeTimer!=='undefined'&&autoForgeTimer!==null)return;
 autoForgeTimer=setTimeout(function(){
  autoForgeTimer=null;
  if(!S.forge.autoForge||pausedForCompare)return;
  var shouldRearm=true;
  try{
   var cost=forgeCost(S.forge.level);
   if(S.minerai>=cost){
    var affordable=Math.max(1,Math.floor(Number(S.minerai||0)/Math.max(1,cost)));
    var amount=Math.max(1,Math.min(autoBatch(),affordable));
    var dustBefore=Number(S.poussiere)||0;
    var res=forgeSummon(amount)||[];
    var recycled=res.filter(function(r){return !!(r&&r.recycled);});
    if(recycled.length){
      settleAutoDust(res,dustBefore,true);
      /* A second settlement catches any late state write from another runtime layer.
         The same baseline is safe because only the missing delta can be credited. */
      setTimeout(function(){try{settleAutoDust(res,dustBefore,false);}catch(_){}},80);
    }
    var wanted=res.filter(isWanted);
    if(wanted.length){
      wanted.forEach(function(r){r.__autoForgeCompareV199=true;});
      pausedForCompare=true;
      shouldRearm=false;
      showForgeResult(wanted);
    }
   }
  }catch(err){console.error('auto-forge filter comparison tick failed',err);}
  finally{if(shouldRearm&&S.forge.autoForge&&!pausedForCompare)scheduleAutoForge(1500);}
 },Math.max(0,delay==null?1500:delay));
};

if(S.forge.autoForge)scheduleAutoForge(0);
})();
