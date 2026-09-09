/* SHADOWREACH · Forge Panel Authority V260
   Renderer-level authority for the Home Forge panel.
   Rebuilds #homeForge before it enters the live DOM, instead of decorating it after render.
   - Compact upgrade row.
   - Accelerators hidden behind native <details> / Vitesse.
   - Dedicated loot space before filter.
   - Permanent Forger / batch / AUTO row.
   - Compact AUTO status only.
   - No MutationObserver, no forgeSummon wrapper, no economy/progression changes.
*/
(function(){
'use strict';
if(window.__srForgePanelAuthorityV260)return;
window.__srForgePanelAuthorityV260=true;
if(typeof S==='undefined'||!S.forge||typeof SCREENS==='undefined'||!SCREENS.accueil)return;

var nativeAccueil=SCREENS.accueil;

function safe(fn,fallback){try{return fn();}catch(_){return fallback==null?'':fallback;}}
function esc2(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':'&quot;';});}
function forgeAccelHTML(){
  try{
    var arr=(typeof ACCEL_DEFS!=='undefined'?ACCEL_DEFS:[]).filter(function(a){return (S.accels&&S.accels[a.key]||0)>0;});
    if(!arr.length)return '<span class="mute tiny">Aucun accélérateur</span>';
    return arr.map(function(a){
      return '<button type="button" class="srForgeSpeedChip260" data-act="accel" data-arg="'+esc2(a.key)+'" data-arg2="forge">⚡ '+esc2(a.label)+' <b>×'+Number(S.accels[a.key]||0)+'</b></button>';
    }).join('');
  }catch(_){return '<span class="mute tiny">Aucun accélérateur</span>';}
}
function filterLabel(){
  try{
    var d=(typeof forgeDiscarded==='function'?forgeDiscarded(S):[]);
    if(!S.forge.filter||!d.length)return 'Filtre · tout est conservé';
    return 'Filtre · '+d.map(function(r){return RARITY&&RARITY[r]?RARITY[r].label:String(r);}).join(', ')+' → poussière';
  }catch(_){return 'Filtre';}
}
function upgradeHTML(){
  var atMax=safe(function(){return S.forge.level>=RULES.FORGE_MAX;},false);
  if(atMax)return '<div class="srForgeUpgrade260 max"><b>Forge au niveau maximum</b></div>';
  var now=Date.now(),end=Number(S.forge.upgradeEnd||0),upgrading=end>now,done=end>0&&!upgrading;
  if(done){
    return '<div class="srForgeUpgrade260 done"><div><b>Amélioration terminée</b><span class="mute tiny">Niv.'+(S.forge.level+1)+' prêt</span></div>'+safe(function(){return btn('Récupérer',{cls:'green',small:true,act:'forgeCollect',style:'width:auto;flex:0 0 auto'});},'<button data-act="forgeCollect">Récupérer</button>')+'</div>';
  }
  if(upgrading){
    var total=Math.max(1,safe(function(){return forgeUpgTimeFor(S);},1));
    var remain=Math.max(0,(end-now)/1000),pct=Math.max(0,Math.min(100,100-remain/total*100));
    var progress=safe(function(){return bar(pct,C.gold,4);},'<div class="srForgeProgressFallback260"><i style="width:'+pct+'%"></i></div>');
    return '<div class="srForgeUpgrade260 running"><div class="srForgeUpgradeTop260"><div class="flex1"><b>Amélioration → Niv.'+(S.forge.level+1)+'</b>'+progress+'</div><strong>⏱ '+safe(function(){return fmtTime(remain);},Math.ceil(remain)+'s')+'</strong></div><details class="srForgeSpeed260"><summary>⚡ Vitesse <span>⌄</span></summary><div class="srForgeSpeedList260">'+forgeAccelHTML()+'</div></details></div>';
  }
  var cost=safe(function(){return forgeUpgCostFor(S);},0),ok=Number(S.gold||0)>=cost,time=safe(function(){return forgeUpgTimeFor(S);},0);
  return '<div class="srForgeUpgrade260 ready"><div class="srForgeUpgradeReadyText260"><span class="mute tiny">Prochaine amélioration</span><b>Niv.'+(S.forge.level+1)+' · '+safe(function(){return fmt(cost);},cost)+' or</b><span class="mute tiny">'+(time<=0?'Instantané':safe(function(){return fmtTime(time);},time+'s'))+'</span></div>'+safe(function(){return btn('Améliorer',{small:true,cls:ok?'green':'',act:'forgeUpgradeAsk',dis:!ok,style:'width:auto;flex:0 0 auto'});},'<button data-act="forgeUpgradeAsk" '+(!ok?'disabled':'')+'>Améliorer</button>')+'</div>';
}
function actionsHTML(){
  var c=safe(function(){return forgeCost(S.forge.level);},0),batch=Math.max(1,safe(function(){return forgeBatch(S);},1)),can1=Number(S.minerai||0)>=c,canB=Number(S.minerai||0)>=c*batch;
  var forge1=safe(function(){return btn('<span class="srForgeActionLabel260">'+ic('hammer',13)+'<b>Forger</b><small>'+ic('minerai',9)+safe(function(){return fmt(c);},c)+'</small></span>',{cls:'blue',small:true,act:'forge',arg:1,dis:!can1,style:'flex:1;min-width:0'});},'<button data-act="forge" data-arg="1" '+(!can1?'disabled':'')+'>Forger</button>');
  var forgeB=batch>1?safe(function(){return btn('<span class="srForgeBatchLabel260"><b>×'+batch+'</b><small>'+ic('minerai',9)+safe(function(){return fmt(c*batch);},c*batch)+'</small></span>',{cls:'blue',small:true,act:'forge',arg:batch,dis:!canB,style:'width:78px;flex:0 0 78px'});},'<button data-act="forge" data-arg="'+batch+'" '+(!canB?'disabled':'')+'>×'+batch+'</button>'):'';
  return '<div class="srForgeActions260">'+forge1+forgeB+'<div class="tgl '+(S.forge.autoForge?'on':'off')+'" data-act="autoForge"><span>AUTO</span><i></i></div></div>'+
    (S.forge.autoForge?'<div class="srForgeAutoStatus260"><i></i><b>Auto-Forge active</b><span class="mute tiny">×'+Math.max(1,Number(S.forge.autoBatch||1))+' par cycle</span></div>':'');
}
function forgeHTML(){
  var lvl=Number(S.forge.level||1),min=safe(function(){return fmt(S.minerai);},Number(S.minerai||0));
  var header='<div class="srForgeHead260"><div class="srForgeHeadLeft260"><span class="srForgeHammer260">'+safe(function(){return ic('hammer',12);},'⚒')+'</span><b>FORGE NIV.'+lvl+'</b><button class="iBtn" data-act="rarityInfo" title="Raretés">i</button>'+safe(function(){return starRow('forge','var(--goldLit)');},'')+'</div><div class="srForgeMineral260">'+safe(function(){return ic('minerai',12);},'◈')+'<b>'+min+'</b></div></div>';
  var ascend=safe(function(){return ascendCta('forge');},'');
  var filter='<div class="fgFilter srForgeFilter260" data-act="forgeFilter">'+safe(function(){return ic('trash',12);},'♻')+'<span class="flex1 tiny b">'+esc2(filterLabel())+'</span><span class="pill" style="color:'+(S.forge.filter?'var(--purpleLit)':'var(--dim)')+';border-color:'+(S.forge.filter?'var(--purple)':'var(--line)')+'">'+(S.forge.filter?'ACTIF':'INACTIF')+'</span></div>';
  return '<div class="card frame homeForge srForgePanel260" id="homeForge">'+header+upgradeHTML()+ascend+'<div class="srForgeLootReserve260" aria-hidden="true"></div>'+actionsHTML()+filter+'</div>';
}
function replaceForge(html){
  try{
    var t=document.createElement('template');t.innerHTML=String(html||'');
    var old=t.content.querySelector('#homeForge');if(!old)return html;
    var holder=document.createElement('template');holder.innerHTML=forgeHTML();
    var neu=holder.content.firstElementChild;if(!neu)return html;
    old.replaceWith(neu);
    return t.innerHTML;
  }catch(e){console.warn('Forge renderer V260 fallback',e);return html;}
}
SCREENS.accueil=function(){return replaceForge(nativeAccueil.apply(this,arguments));};

var old259=document.getElementById('srForgePanelCompactV259Style');if(old259)old259.remove();
var st=document.createElement('style');st.id='srForgePanelAuthorityV260Style';st.textContent='\
.srForgePanel260{padding:7px 8px 9px!important;overflow:visible!important}.srForgeHead260{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:28px}.srForgeHeadLeft260,.srForgeMineral260{display:flex;align-items:center;gap:6px}.srForgeHeadLeft260>b{font:900 12px/1 Georgia,serif;color:var(--goldLit);letter-spacing:.5px;white-space:nowrap}.srForgeHammer260{width:24px;height:24px;border:1px solid var(--goldDim);border-radius:8px;display:grid;place-items:center}.srForgeMineral260{color:var(--blueLit);font-size:11px;white-space:nowrap}.srForgeUpgrade260{margin-top:5px;border:1px solid #314762;border-radius:11px;background:#0b1525;padding:6px 7px}.srForgeUpgrade260.max{text-align:center;color:var(--greenLit)}.srForgeUpgrade260.done,.srForgeUpgrade260.ready{display:flex;align-items:center;justify-content:space-between;gap:8px}.srForgeUpgrade260.done>div,.srForgeUpgradeReadyText260{display:flex;flex-direction:column;gap:2px;min-width:0}.srForgeUpgradeTop260{display:flex;align-items:flex-start;gap:8px}.srForgeUpgradeTop260 b,.srForgeUpgrade260.ready b{font-size:9.5px;color:var(--goldLit)}.srForgeUpgradeTop260 strong{font-size:10px;color:var(--goldLit);white-space:nowrap}.srForgeSpeed260{margin-top:5px}.srForgeSpeed260 summary{list-style:none;cursor:pointer;height:30px;border:1px solid #2e7186;border-radius:9px;background:linear-gradient(180deg,#102a38,#0a1c27);display:flex;align-items:center;justify-content:center;gap:6px;color:#aaf1fb;font:900 10px system-ui}.srForgeSpeed260 summary::-webkit-details-marker{display:none}.srForgeSpeed260[open] summary span{transform:rotate(180deg)}.srForgeSpeed260 summary span{transition:transform .18s}.srForgeSpeedList260{display:flex;gap:5px;overflow-x:auto;padding-top:6px}.srForgeSpeedChip260{flex:0 0 auto;border:1px solid #3fcfd6;border-radius:999px;background:#0c1e2b;color:#9ef2f8;padding:6px 9px;font:800 9px system-ui}.srForgeLootReserve260{height:4px}.srForgeActions260{display:flex;align-items:stretch;gap:6px;margin-top:5px}.srForgeActions260>.btn{min-height:48px!important}.srForgeActionLabel260,.srForgeBatchLabel260{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;line-height:1}.srForgeActionLabel260 small,.srForgeBatchLabel260 small{font-size:8px;opacity:.8;display:flex;gap:2px;align-items:center}.srForgeActions260 .tgl{flex:0 0 96px;min-width:96px}.srForgeAutoStatus260{height:24px;margin-top:4px;border-radius:8px;background:#0a1822;display:flex;align-items:center;gap:6px;padding:0 8px;color:#79e891;font-size:9px}.srForgeAutoStatus260>i{width:7px;height:7px;border-radius:50%;background:#55e276;box-shadow:0 0 8px #55e276}.srForgeFilter260{margin-top:5px!important;min-height:34px!important}.srForgePanel260 #srForgeLoot258{margin:6px 0 12px!important}.srForgePanel260 #srForgeLoot258 .srForgeGroup258{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}.srForgePanel260 #srForgeLoot258 .srForgeCard258{min-height:138px!important;border-radius:12px!important;padding-bottom:8px!important}.srForgePanel260 #srForgeLoot258 .srForgeImg258{height:68px!important}.srForgePanel260 #srForgeLoot258 .srForgeImg258 img{width:62px!important;height:62px!important}.srForgePanel260 #srForgeLoot258 .srForgeName258{font-size:10.5px!important}.srForgePanel260 #srForgeLoot258 .srForgeMeta258{font-size:7.5px!important}.srForgePanel260 #srForgeLoot258 .srForgeState258{font-size:7.5px!important;padding-top:7px!important}@media(max-width:390px){.srForgePanel260{padding-left:6px!important;padding-right:6px!important}.srForgeHeadLeft260>b{font-size:11px}.srForgeActions260 .tgl{flex-basis:88px;min-width:88px}.srForgePanel260 #srForgeLoot258 .srForgeCard258{min-height:132px!important}.srForgePanel260 #srForgeLoot258 .srForgeImg258{height:62px!important}.srForgePanel260 #srForgeLoot258 .srForgeImg258 img{width:56px!important;height:56px!important}}@media(prefers-reduced-motion:reduce){.srForgeSpeed260 summary span{transition:none!important}}';document.head.appendChild(st);

try{if(typeof render==='function')render();}catch(_){}
window.__srForgePanelAuthorityV260={version:260,build:forgeHTML};
})();
