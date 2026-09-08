/* SHADOWREACH · Auto-Forge Compare V199
   AUTO follows the Forge filter only: every kept result is surfaced for comparison,
   regardless of power, base stats or affixes. Recycled results stay silent.
   When a kept result appears, AUTO pauses until the comparison queue is resolved.
*/
(function(){
'use strict';
if(window.__srAutoForgeCompareV199)return;window.__srAutoForgeCompareV199=true;
if(typeof S==='undefined'||!S.forge||typeof forgeSummon!=='function'||typeof showForgeResult!=='function')return;

var pausedForCompare=false;

function isWanted(r){
 return !!(r&&!r.recycled&&r.id);
}
function resume(){
 if(!pausedForCompare)return;
 pausedForCompare=false;
 if(S.forge.autoForge) scheduleAutoForge(1500);
}
window.__srResumeAutoForgeV199=resume;
window.__srAutoForgePausedForCompareV199=function(){return pausedForCompare;};

try{
 if(typeof autoForgeTimer!=='undefined'&&autoForgeTimer!==null){clearTimeout(autoForgeTimer);autoForgeTimer=null;}
}catch(_){}

scheduleAutoForge=function(delay){
 if(pausedForCompare)return;
 if(typeof autoForgeTimer!=='undefined'&&autoForgeTimer!==null)return;
 autoForgeTimer=setTimeout(function(){
  autoForgeTimer=null;
  if(!S.forge.autoForge||pausedForCompare)return;
  var shouldRearm=true;
  try{
   if(S.minerai>=forgeCost(S.forge.level)){
    var res=forgeSummon(1)||[];
    var wanted=res.filter(isWanted);
    if(wanted.length){
      /* Mark these rows so the comparison authority keeps every filtered drop,
         including two results for the same slot from a free extra forge. */
      wanted.forEach(function(r){r.__autoForgeCompareV199=true;});
      pausedForCompare=true;
      shouldRearm=false;
      showForgeResult(wanted);
    }
   }
  }catch(err){console.error('auto-forge filter comparison tick failed',err);}
  finally{
   if(shouldRearm&&S.forge.autoForge&&!pausedForCompare)scheduleAutoForge(1500);
  }
 },Math.max(0,delay==null?1500:delay));
};

if(S.forge.autoForge)scheduleAutoForge(0);
})();
