/* SHADOWREACH · Auto-Forge Compare V199 / V273 batch authority
   AUTO follows the Forge filter only: every kept result is surfaced for comparison.
   Canonical persisted batch sizes are 1/3/5/10, matching the Forge progression gate.
*/
(function(){
'use strict';
if(window.__srAutoForgeCompareV199)return;window.__srAutoForgeCompareV199=true;
if(typeof S==='undefined'||!S.forge||typeof forgeSummon!=='function'||typeof showForgeResult!=='function')return;

var pausedForCompare=false;
var VALID_BATCH=[1,3,5,10];
function autoBatch(){var n=Math.floor(Number(S.forge.autoBatch)||1);return VALID_BATCH.indexOf(n)>=0?n:1;}
function isWanted(r){return !!(r&&!r.recycled&&r.id);}
function resume(){
 if(!pausedForCompare)return;
 pausedForCompare=false;
 if(S.forge.autoForge) scheduleAutoForge(1500);
}
window.__srResumeAutoForgeV199=resume;
window.__srAutoForgePausedForCompareV199=function(){return pausedForCompare;};

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
    var res=forgeSummon(amount)||[];
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
