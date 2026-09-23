/* SHADOWREACH · Auto-Forge Compare V199 / V429 canonical dust authority
   AUTO follows the Forge filter only: every kept result is surfaced for comparison.
   Canonical persisted batch sizes are 1/3/5/10, matching the Forge progression gate.
   V350: recycled Dust is valued from the canonical rarity table first, so a stale
   `dust:1` payload can never flatten Rare/Epic/Mythic/etc. rewards to +1.
*/
(function(){
'use strict';
if(window.__srAutoForgeCompareV199)return;window.__srAutoForgeCompareV199=true;
if(typeof S==='undefined'||!S.forge||typeof forgeSummon!=='function'||typeof showForgeResult!=='function')return;

var pausedForCompare=false;
var VALID_BATCH=[1,3,5,10];
function autoBatch(){var n=Math.floor(Number(S.forge.autoBatch)||1);return VALID_BATCH.indexOf(n)>=0?n:1;}
function isWanted(r){return !!(r&&!r.recycled&&r.id);}
function canonicalRarityDust(raw){
 try{
  var cfg=window.__srDustEconomyConfigV293;
  if(cfg&&typeof cfg.valueForItem==='function'){
   var exact=Math.max(0,Math.floor(Number(cfg.valueForItem(S,{rarity:raw}))||0));
   if(exact>0)return exact;
  }
  if(cfg&&typeof cfg.valueForRarity==='function'){
   var v=Math.max(0,Math.floor(Number(cfg.valueForRarity(raw))||0));
   if(v>0)return v;
  }
  var map=cfg&&cfg.byRarity;
  var key=String(raw==null?'':raw).trim().toUpperCase();
  try{key=key.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(_){}
  key=key.replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  var n=map&&Number(map[key]);
  if(isFinite(n)&&n>0)return Math.floor(n);
 }catch(_){}
 return 0;
}
function recycledDustValue(r){
 if(!r||!r.recycled)return 0;
 var canonical=canonicalRarityDust(r.rarity);
 if(canonical>0){r.dust=canonical;return canonical;}
 try{
  if(typeof dustValue==='function'&&r.rarity){
   var fallback=Math.max(0,Math.floor(Number(dustValue(S,{rarity:r.rarity,power:r.power||0,originalPower:r.power||0}))||0));
   if(fallback>0){r.dust=fallback;return fallback;}
  }
 }catch(_){}
 var direct=Math.max(0,Math.floor(Number(r.dust)||0));
 if(direct>0)return direct;
 return 0;
}
function expectedAutoDust(res){
 if(!Array.isArray(res)||!res.length)return 0;
 return res.reduce(function(sum,r){return sum+recycledDustValue(r);},0);
}
function refreshDustNow(){
 try{if(typeof renderHUD==='function')renderHUD();}catch(_){}
 try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){}
}
function showForgeDustNotice(expected,count,label){
 try{
  var panel=document.getElementById('homeForge');
  if(!panel)return false;
  var old=document.getElementById('srAutoDustNoticeV371');
  if(old)old.remove();
  var d=document.createElement('div');
  d.id='srAutoDustNoticeV371';
  d.textContent=(label||'Auto-Forge')+' · +'+(typeof fmt==='function'?fmt(expected):expected)+' poussière';
  d.style.cssText='position:absolute;left:10px;right:96px;bottom:63px;z-index:80;min-height:18px;padding:2px 7px;border-radius:8px;border:1px solid rgba(87,214,126,.55);background:rgba(8,46,27,.88);color:#78E996;font:900 9px/14px system-ui;text-shadow:0 1px 1px rgba(0,0,0,.55);box-shadow:0 2px 7px rgba(0,0,0,.28);pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  panel.appendChild(d);
  setTimeout(function(){var x=document.getElementById('srAutoDustNoticeV371');if(x)x.remove();},1650);
  return true;
 }catch(_){return false;}
}
function ensureAutoDust(res,before){
 var expected=expectedAutoDust(res);
 if(!expected)return 0;
 var credited=Math.max(0,(Number(S.poussiere)||0)-(Number(before)||0));
 var missing=Math.max(0,expected-credited);
 if(missing){
  try{S.poussiere=(Number(S.poussiere)||0)+missing;}catch(_){return 0;}
 }
 refreshDustNow();
 return missing;
}
function settleAutoDust(res,before,notify){
 var expected=expectedAutoDust(res);
 if(!expected)return 0;
 var missing=ensureAutoDust(res,before);
 try{if(typeof saveNow==='function')saveNow();}catch(_){}
 refreshDustNow();
 var count=res.filter(function(r){return !!(r&&r.recycled);}).length;
 var shownInForge=showForgeDustNotice(expected,count);
 if(notify&&!shownInForge){
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
window.__srAutoForgeDustV349={version:349,ensure:ensureAutoDust,settle:settleAutoDust,value:recycledDustValue,immediate:true};
window.__srAutoForgeDustV350={version:350,ensure:ensureAutoDust,settle:settleAutoDust,value:recycledDustValue,canonical:true,immediate:true};
window.__srAutoForgeDustV370={version:370,ensure:ensureAutoDust,settle:settleAutoDust,value:recycledDustValue,canonical:true,immediate:true,quietWhenForgeLane:true};
window.__srAutoForgeDustV371={version:371,ensure:ensureAutoDust,settle:settleAutoDust,value:recycledDustValue,canonical:true,immediate:true,greenForgeFeedback:true};
window.__srShowForgeDustNoticeV378=showForgeDustNotice;
window.__srAutoForgeDustV378={version:378,ensure:ensureAutoDust,settle:settleAutoDust,value:recycledDustValue,canonical:true,immediate:true,greenForgeFeedback:true,manualFeedbackBridge:true};
window.__srAutoForgeDustV429={version:429,ensure:ensureAutoDust,settle:settleAutoDust,value:recycledDustValue,canonical:true,rarityOnly:true,treeBonusAware:true};

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
    if(recycled.length)settleAutoDust(res,dustBefore,!document.getElementById('srForgeLoot273'));
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
