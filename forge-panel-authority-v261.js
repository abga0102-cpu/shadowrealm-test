/* SHADOWREACH · Forge Panel Authority V261
   Renderer-level Home Forge authority.
   - Compact single-row upgrade status.
   - Speed accelerators live in a persistent popover, not layout height.
   - Dedicated loot reserve used by Forge UX V261.
   - Permanent Forger / batch / AUTO line; AUTO state is integrated, not a second block.
   - No MutationObserver, no forgeSummon wrapper, no economy/progression changes.
*/
(function(){
'use strict';
if(window.__srForgePanelAuthorityV261)return;window.__srForgePanelAuthorityV261=true;
if(typeof S==='undefined'||!S.forge||typeof SCREENS==='undefined'||!SCREENS.accueil)return;
var nativeAccueil=SCREENS.accueil;
var SPEED_KEY='shadowreach.forge.speed.open.v261';
function safe(fn,fallback){try{return fn();}catch(_){return fallback==null?'':fallback;}}
function esc2(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':'&quot;';});}
function speedOpen(){try{return sessionStorage.getItem(SPEED_KEY)==='1';}catch(_){return false;}}
function setSpeedOpen(v){try{sessionStorage.setItem(SPEED_KEY,v?'1':'0');}catch(_){} }
function forgeAccelHTML(){
  try{
    var arr=(typeof ACCEL_DEFS!=='undefined'?ACCEL_DEFS:[]).filter(function(a){return (S.accels&&S.accels[a.key]||0)>0;});
    if(!arr.length)return '<span class="mute tiny">Aucun accélérateur disponible</span>';
    return arr.map(function(a){return '<button type="button" class="srForgeSpeedChip261" data-act="accel" data-arg="'+esc2(a.key)+'" data-arg2="forge">⚡ '+esc2(a.label)+' <b>×'+Number(S.accels[a.key]||0)+'</b></button>';}).join('');
  }catch(_){return '<span class="mute tiny">Aucun accélérateur disponible</span>';}
}
function filterLabel(){
  try{var d=(typeof forgeDiscarded==='function'?forgeDiscarded(S):[]);if(!S.forge.filter||!d.length)return 'Filtre · tout est conservé';return 'Filtre · '+d.map(function(r){return RARITY&&RARITY[r]?RARITY[r].label:String(r);}).join(', ')+' → poussière';}catch(_){return 'Filtre';}
}
function speedPopover(){var open=speedOpen();return '<div class="srForgeSpeedPop261 '+(open?'open':'')+'" aria-hidden="'+(open?'false':'true')+'"><div class="srForgeSpeedPopHead261"><b>Accélérateurs</b><button type="button" class="srForgeSpeedClose261" aria-label="Fermer">×</button></div><div class="srForgeSpeedList261">'+forgeAccelHTML()+'</div></div>';}
function speedBtn(){return '<button type="button" class="srForgeSpeedBtn261 '+(speedOpen()?'open':'')+'" aria-expanded="'+(speedOpen()?'true':'false')+'">⚡<span>Vitesse</span></button>';}
function upgradeHTML(){
  var atMax=safe(function(){return S.forge.level>=RULES.FORGE_MAX;},false);
  if(atMax)return '<div class="srForgeUpgrade261 max"><b>Forge au niveau maximum</b></div>';
  var now=Date.now(),end=Number(S.forge.upgradeEnd||0),upgrading=end>now,done=end>0&&!upgrading;
  if(done)return '<div class="srForgeUpgrade261"><div class="srForgeUpText261"><b>Amélioration terminée</b><span class="mute tiny">Niv.'+(S.forge.level+1)+' prêt</span></div>'+safe(function(){return btn('Récupérer',{cls:'green',small:true,act:'forgeCollect',style:'width:auto;flex:0 0 auto'});},'<button data-act="forgeCollect">Récupérer</button>')+'</div>';
  if(upgrading){
    var total=Math.max(1,safe(function(){return forgeUpgTimeFor(S);},1)),remain=Math.max(0,(end-now)/1000),pct=Math.max(0,Math.min(100,100-remain/total*100));
    var progress=safe(function(){return bar(pct,C.gold,3);},'<div class="srForgeProgressFallback261"><i style="width:'+pct+'%"></i></div>');
    return '<div class="srForgeUpgrade261 running"><div class="srForgeUpText261 flex1"><div class="srForgeUpLine261"><b>Niv.'+(S.forge.level+1)+'</b><span>'+safe(function(){return fmtTime(remain);},Math.ceil(remain)+'s')+'</span></div>'+progress+'</div>'+speedBtn()+speedPopover()+'</div>';
  }
  var cost=safe(function(){return forgeUpgCostFor(S);},0),ok=Number(S.gold||0)>=cost,time=safe(function(){return forgeUpgTimeFor(S);},0);
  return '<div class="srForgeUpgrade261"><div class="srForgeUpText261"><span class="mute tiny">Prochaine amélioration</span><b>Niv.'+(S.forge.level+1)+' · '+safe(function(){return fmt(cost);},cost)+' or · '+(time<=0?'Instantané':safe(function(){return fmtTime(time);},time+'s'))+'</b></div>'+safe(function(){return btn('Améliorer',{small:true,cls:ok?'green':'',act:'forgeUpgradeAsk',dis:!ok,style:'width:auto;flex:0 0 auto'});},'<button data-act="forgeUpgradeAsk" '+(!ok?'disabled':'')+'>Améliorer</button>')+'</div>';
}
function actionsHTML(){
  var c=safe(function(){return forgeCost(S.forge.level);},0),batch=Math.max(1,safe(function(){return forgeBatch(S);},1)),can1=Number(S.minerai||0)>=c,canB=Number(S.minerai||0)>=c*batch,autoBatch=Math.max(1,Number(S.forge.autoBatch||1));
  var forge1=safe(function(){return btn('<span class="srForgeActionLabel261">'+ic('hammer',13)+'<b>Forger</b><small>'+ic('minerai',9)+safe(function(){return fmt(c);},c)+'</small></span>',{cls:'blue',small:true,act:'forge',arg:1,dis:!can1,style:'flex:1;min-width:0'});},'<button data-act="forge" data-arg="1" '+(!can1?'disabled':'')+'>Forger</button>');
  var forgeB=batch>1?safe(function(){return btn('<span class="srForgeBatchLabel261"><b>×'+batch+'</b><small>'+ic('minerai',9)+safe(function(){return fmt(c*batch);},c*batch)+'</small></span>',{cls:'blue',small:true,act:'forge',arg:batch,dis:!canB,style:'width:72px;flex:0 0 72px'});},'<button data-act="forge" data-arg="'+batch+'" '+(!canB?'disabled':'')+'>×'+batch+'</button>'):'';
  return '<div class="srForgeActions261">'+forge1+forgeB+'<div class="tgl '+(S.forge.autoForge?'on':'off')+' srForgeAuto261" data-act="autoForge"><span>'+(S.forge.autoForge?'● AUTO ×'+autoBatch:'AUTO')+'</span><i></i></div></div>';
}
function forgeHTML(){
  var lvl=Number(S.forge.level||1),min=safe(function(){return fmt(S.minerai);},Number(S.minerai||0));
  var header='<div class="srForgeHead261"><div class="srForgeHeadLeft261"><span class="srForgeHammer261">'+safe(function(){return ic('hammer',12);},'⚒')+'</span><b>FORGE NIV.'+lvl+'</b><button class="iBtn" data-act="rarityInfo" title="Raretés">i</button>'+safe(function(){return starRow('forge','var(--goldLit)');},'')+'</div><div class="srForgeMineral261">'+safe(function(){return ic('minerai',12);},'◈')+'<b>'+min+'</b></div></div>';
  var ascend=safe(function(){return ascendCta('forge');},'');
  var filter='<div class="fgFilter srForgeFilter261" data-act="forgeFilter">'+safe(function(){return ic('trash',12);},'♻')+'<span class="flex1 tiny b">'+esc2(filterLabel())+'</span><span class="pill" style="color:'+(S.forge.filter?'var(--purpleLit)':'var(--dim)')+';border-color:'+(S.forge.filter?'var(--purple)':'var(--line)')+'">'+(S.forge.filter?'ACTIF':'INACTIF')+'</span></div>';
  return '<div class="card frame homeForge srForgePanel261" id="homeForge">'+header+upgradeHTML()+ascend+'<div class="srForgeLootReserve260" aria-live="polite"></div>'+actionsHTML()+filter+'</div>';
}
function replaceForge(html){try{var t=document.createElement('template');t.innerHTML=String(html||'');var old=t.content.querySelector('#homeForge');if(!old)return html;var holder=document.createElement('template');holder.innerHTML=forgeHTML();var neu=holder.content.firstElementChild;if(!neu)return html;old.replaceWith(neu);return t.innerHTML;}catch(e){console.warn('Forge renderer V261 fallback',e);return html;}}
SCREENS.accueil=function(){return replaceForge(nativeAccueil.apply(this,arguments));};
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('.srForgeSpeedBtn261,.srForgeSpeedClose261'):null;if(!b)return;e.preventDefault();e.stopPropagation();setSpeedOpen(b.classList.contains('srForgeSpeedBtn261')?!speedOpen():false);try{if(typeof scheduleRender==='function')scheduleRender();else if(typeof render==='function')render();}catch(_){}},true);
var st=document.createElement('style');st.id='srForgePanelAuthorityV261Style';st.textContent='\
.srForgePanel261{position:relative;padding:6px 7px 7px!important;overflow:visible!important}.srForgeHead261{display:flex;align-items:center;justify-content:space-between;gap:7px;height:26px;flex:0 0 26px}.srForgeHeadLeft261,.srForgeMineral261{display:flex;align-items:center;gap:5px}.srForgeHeadLeft261>b{font:900 11.5px/1 Georgia,serif;color:var(--goldLit);letter-spacing:.45px;white-space:nowrap}.srForgeHammer261{width:22px;height:22px;border:1px solid var(--goldDim);border-radius:7px;display:grid;place-items:center}.srForgeMineral261{color:var(--blueLit);font-size:10.5px;white-space:nowrap}.srForgeUpgrade261{position:relative;margin-top:4px;min-height:36px;border:1px solid #314762;border-radius:9px;background:#0b1525;padding:4px 6px;display:flex;align-items:center;gap:6px}.srForgeUpgrade261.max{justify-content:center;color:var(--greenLit);min-height:30px}.srForgeUpText261{display:flex;flex-direction:column;gap:2px;min-width:0}.srForgeUpText261>b,.srForgeUpLine261 b{font-size:9px;color:var(--goldLit)}.srForgeUpLine261{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:9px;color:var(--goldLit)}.srForgeSpeedBtn261{height:28px;min-width:70px;border:1px solid #2e7186;border-radius:8px;background:linear-gradient(180deg,#102a38,#0a1c27);color:#aaf1fb;display:flex;align-items:center;justify-content:center;gap:4px;font:900 9px system-ui;flex:0 0 auto}.srForgeSpeedBtn261.open{border-color:#55d9e3;box-shadow:0 0 0 1px #55d9e344 inset}.srForgeSpeedPop261{display:none;position:absolute;z-index:120;left:5px;right:5px;top:calc(100% + 4px);border:1px solid #2e7186;border-radius:10px;background:#071521f7;box-shadow:0 10px 28px #000c;padding:7px}.srForgeSpeedPop261.open{display:block}.srForgeSpeedPopHead261{display:flex;align-items:center;justify-content:space-between;color:#aaf1fb;font-size:9px;margin-bottom:5px}.srForgeSpeedClose261{width:24px;height:24px;border:1px solid #3b5873;border-radius:7px;background:#101c2b;color:#d7e7f8;font-weight:900}.srForgeSpeedList261{display:flex;gap:5px;overflow-x:auto}.srForgeSpeedChip261{flex:0 0 auto;border:1px solid #3fcfd6;border-radius:999px;background:#0c1e2b;color:#9ef2f8;padding:6px 9px;font:800 9px system-ui}.srForgeLootReserve260{height:104px;min-height:104px;max-height:104px;margin-top:4px;flex:0 0 104px;overflow:visible}.srForgeActions261{display:flex;align-items:stretch;gap:5px;margin-top:4px;height:42px;flex:0 0 42px}.srForgeActions261>.btn{min-height:42px!important;height:42px!important}.srForgeActionLabel261,.srForgeBatchLabel261{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;line-height:1}.srForgeActionLabel261 small,.srForgeBatchLabel261 small{font-size:7.5px;opacity:.8;display:flex;gap:2px;align-items:center}.srForgeActions261 .tgl{flex:0 0 92px;min-width:92px;height:42px!important}.srForgeAuto261.on span{color:#78e996;font-size:8.5px}.srForgeFilter261{margin-top:4px!important;height:28px!important;min-height:28px!important;max-height:28px!important;padding:3px 6px!important;flex:0 0 28px}.srForgeFilter261 .pill{font-size:7px!important;padding:2px 5px!important}@media(max-width:390px){.srForgePanel261{padding-left:6px!important;padding-right:6px!important}.srForgeHeadLeft261>b{font-size:10.5px}.srForgeLootReserve260{height:98px;min-height:98px;max-height:98px;flex-basis:98px}.srForgeActions261{height:40px;flex-basis:40px}.srForgeActions261>.btn,.srForgeActions261 .tgl{height:40px!important;min-height:40px!important}.srForgeActions261 .tgl{flex-basis:84px;min-width:84px}.srForgeSpeedBtn261{min-width:62px}.srForgeFilter261{height:27px!important;min-height:27px!important;max-height:27px!important;flex-basis:27px}}@media(max-height:720px){.srForgeLootReserve260{height:90px;min-height:90px;max-height:90px;flex-basis:90px}.srForgeUpgrade261{min-height:32px;padding-top:3px;padding-bottom:3px}.srForgeActions261{height:38px;flex-basis:38px}.srForgeActions261>.btn,.srForgeActions261 .tgl{height:38px!important;min-height:38px!important}}@media(prefers-reduced-motion:reduce){.srForgeSpeedBtn261{transition:none!important}}';document.head.appendChild(st);
try{if(typeof render==='function')render();}catch(_){}
window.__srForgePanelAuthorityV261={version:261,build:forgeHTML};
})();