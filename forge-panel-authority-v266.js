/* SHADOWREACH · Forge Panel Authority V266 / V458
   Canonical renderer-level Home Forge authority.
   V458 restores the always-visible Auto-Forge filter and owns the organized
   Auto-Forge/filter modal layout. UI-only: no economy/progression/save changes.
*/
(function(){
'use strict';
if(window.__srForgePanelAuthorityV266)return;window.__srForgePanelAuthorityV266=true;
if(typeof S==='undefined'||!S.forge||typeof SCREENS==='undefined'||!SCREENS.accueil)return;
var nativeAccueil=SCREENS.accueil;
var SPEED_KEY='shadowreach.forge.speed.open.v266';
function safe(fn,fallback){try{return fn();}catch(_){return fallback==null?'':fallback;}}
function esc2(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':'&quot;';});}
function speedOpen(){try{return sessionStorage.getItem(SPEED_KEY)==='1';}catch(_){return false;}}
function setSpeedOpen(v){try{sessionStorage.setItem(SPEED_KEY,v?'1':'0');}catch(_){} }
function forgeAccelHTML(){try{var arr=(typeof ACCEL_DEFS!=='undefined'?ACCEL_DEFS:[]).filter(function(a){return (S.accels&&S.accels[a.key]||0)>0;});if(!arr.length)return '<span class="mute tiny">Aucun accélérateur disponible</span>';return arr.map(function(a){return '<button type="button" class="srForgeSpeedChip266" data-act="accel" data-arg="'+esc2(a.key)+'" data-arg2="forge">⚡ '+esc2(a.label)+' <b>×'+Number(S.accels[a.key]||0)+'</b></button>';}).join('');}catch(_){return '<span class="mute tiny">Aucun accélérateur disponible</span>';}}
function filterLabel(){try{var d=(typeof forgeDiscarded==='function'?forgeDiscarded(S):[]);if(!S.forge.filter||!d.length)return 'Auto-filtre · tout est conservé';return 'Auto-filtre · '+d.length+' rareté'+(d.length>1?'s':'')+' recyclée'+(d.length>1?'s':'');}catch(_){return 'Auto-filtre';}}
function speedPopover(){var open=speedOpen();return '<div class="srForgeSpeedPop266 '+(open?'open':'')+'" aria-hidden="'+(open?'false':'true')+'"><div class="srForgeSpeedPopHead266"><b>Accélérateurs</b><button type="button" class="srForgeSpeedClose266" aria-label="Fermer">×</button></div><div class="srForgeSpeedList266">'+forgeAccelHTML()+'</div></div>';}
function speedBtn(){return '<button type="button" class="srForgeSpeedBtn266 '+(speedOpen()?'open':'')+'" aria-expanded="'+(speedOpen()?'true':'false')+'">⚡<span>Vitesse</span></button>';}
function lifetimeMasteryHTML(){
  return safe(function(){
    var api=window.__srForgeLifetimeMasteryV445;if(!api||typeof api.info!=='function')return '';
    var m=api.info(S),rank=m.rank?m.roman:'—';
    var meta=m.maxed?fmt(m.count)+' forges · MAX':fmt(m.count)+' / '+fmt(m.nextNeed)+' forges';
    var progress=Math.max(0,Math.min(100,Number(m.progressPct)||0));
    return '<div class="srForgeLifetime445" title="Chaque forge payée compte. Les objets bonus gratuits ne comptent pas.">'+
      '<div class="srForgeLifetimeTop445"><b>MAÎTRISE ÉQUIPEMENT '+rank+'</b>'+
      '<span>+'+m.bonusPct+'% base</span></div>'+
      '<div class="srForgeLifetimeBar445"><i style="width:'+progress+'%"></i></div>'+
      '<div class="srForgeLifetimeMeta445"><span>'+meta+'</span><span>'+(m.maxed?'Rang IX':('→ '+m.nextRoman))+'</span></div></div>';
  },'');
}
function upgradeHTML(){var atMax=safe(function(){return S.forge.level>=RULES.FORGE_MAX;},false);if(atMax)return '<div class="srForgeUpgrade266 max"><b>Forge au niveau maximum</b></div>';var now=Date.now(),end=Number(S.forge.upgradeEnd||0),upgrading=end>now,done=end>0&&!upgrading;if(done)return '<div class="srForgeUpgrade266"><div class="srForgeUpText266"><b>Amélioration terminée</b><span class="mute tiny">Niv.'+(S.forge.level+1)+' prêt</span></div>'+safe(function(){return btn('Récupérer',{cls:'green',small:true,act:'forgeCollect',style:'width:auto;flex:0 0 auto'});},'<button data-act="forgeCollect">Récupérer</button>')+'</div>';if(upgrading){var total=Math.max(1,safe(function(){return forgeUpgTimeFor(S);},1)),remain=Math.max(0,(end-now)/1000),pct=Math.max(0,Math.min(100,100-remain/total*100));var progress=safe(function(){return bar(pct,C.gold,3);},'<div class="srForgeProgressFallback266"><i style="width:'+pct+'%"></i></div>');return '<div class="srForgeUpgrade266 running"><div class="srForgeUpText266 flex1"><div class="srForgeUpLine266"><b>Niv.'+(S.forge.level+1)+'</b><span>'+safe(function(){return fmtTime(remain);},Math.ceil(remain)+'s')+'</span></div>'+progress+'</div>'+speedBtn()+speedPopover()+'</div>';}var cost=safe(function(){return forgeUpgCostFor(S);},0),ok=Number(S.gold||0)>=cost,time=safe(function(){return forgeUpgTimeFor(S);},0);return '<div class="srForgeUpgrade266"><div class="srForgeUpText266"><span class="mute tiny">Prochaine amélioration</span><b>Niv.'+(S.forge.level+1)+' · '+safe(function(){return fmt(cost);},cost)+' or · '+(time<=0?'Instantané':safe(function(){return fmtTime(time);},time+'s'))+'</b></div>'+safe(function(){return btn('Améliorer',{small:true,cls:ok?'green':'',act:'forgeUpgradeAsk',dis:!ok,style:'width:auto;flex:0 0 auto'});},'<button data-act="forgeUpgradeAsk" '+(!ok?'disabled':'')+'>Améliorer</button>')+'</div>';}
function actionsHTML(){var c=safe(function(){return forgeCost(S.forge.level);},0),batch=Math.max(1,safe(function(){return forgeBatch(S);},1)),can1=Number(S.minerai||0)>=c,canB=Number(S.minerai||0)>=c*batch,autoBatch=Math.max(1,Number(S.forge.autoBatch||1));var forge1=safe(function(){return btn('<span class="srForgeActionLabel266">'+ic('hammer',13)+'<b>Forger</b><small>'+ic('minerai',9)+safe(function(){return fmt(c);},c)+'</small></span>',{cls:'blue',small:true,act:'forge',arg:1,dis:!can1,style:'flex:1;min-width:0'});},'<button data-act="forge" data-arg="1" '+(!can1?'disabled':'')+'>Forger</button>');var forgeB=batch>1?safe(function(){return btn('<span class="srForgeBatchLabel266"><b>×'+batch+'</b><small>'+ic('minerai',9)+safe(function(){return fmt(c*batch);},c*batch)+'</small></span>',{cls:'blue',small:true,act:'forge',arg:batch,dis:!canB,style:'width:70px;flex:0 0 70px'});},'<button data-act="forge" data-arg="'+batch+'" '+(!canB?'disabled':'')+'>×'+batch+'</button>'):'';return '<div class="srForgeActions266">'+forge1+forgeB+'<div class="tgl '+(S.forge.autoForge?'on':'off')+' srForgeAuto266" data-act="autoForge"><span>'+(S.forge.autoForge?'● AUTO ×'+autoBatch:'AUTO')+'</span><i></i></div></div>';}
function forgeHTML(){var lvl=Number(S.forge.level||1),min=safe(function(){return fmt(S.minerai);},Number(S.minerai||0));var header='<div class="srForgeHead266"><div class="srForgeHeadLeft266"><span class="srForgeHammer266">'+safe(function(){return ic('hammer',12);},'⚒')+'</span><b>FORGE NIV.'+lvl+'</b><button class="iBtn" data-act="rarityInfo" title="Raretés">i</button>'+safe(function(){return starRow('forge','var(--goldLit)');},'')+'</div><div class="srForgeMineral266">'+safe(function(){return ic('minerai',12);},'◈')+'<b>'+min+'</b></div></div>';var ascend=safe(function(){return ascendCta('forge');},'');var filter='<div class="fgFilter srForgeFilter266" data-act="forgeFilter">'+safe(function(){return ic('trash',12);},'♻')+'<span class="flex1 tiny b">'+esc2(filterLabel())+'</span><span class="pill" style="color:'+(S.forge.filter?'var(--purpleLit)':'var(--dim)')+';border-color:'+(S.forge.filter?'var(--purple)':'var(--line)')+'">'+(S.forge.filter?'ACTIF':'INACTIF')+'</span></div>';return '<div class="card frame homeForge srForgePanel266" id="homeForge">'+header+lifetimeMasteryHTML()+upgradeHTML()+ascend+'<div class="srForgeLootReserve266" aria-live="polite"></div>'+actionsHTML()+filter+'</div>';}
function replaceForge(html){try{var t=document.createElement('template');t.innerHTML=String(html||'');var old=t.content.querySelector('#homeForge');if(!old)return html;var holder=document.createElement('template');holder.innerHTML=forgeHTML();var neu=holder.content.firstElementChild;if(!neu)return html;old.replaceWith(neu);return t.innerHTML;}catch(e){console.warn('Forge renderer V266 fallback',e);return html;}}
SCREENS.accueil=function(){return replaceForge(nativeAccueil.apply(this,arguments));};
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('.srForgeSpeedBtn266,.srForgeSpeedClose266'):null;if(!b)return;e.preventDefault();e.stopPropagation();setSpeedOpen(b.classList.contains('srForgeSpeedBtn266')?!speedOpen():false);try{if(typeof scheduleRender==='function')scheduleRender();else if(typeof render==='function')render();}catch(_){}},true);

/* V383 · Forge upgrade tap authority.
   The Forge panel is rendered by this late authority, while the generic ACT
   dispatcher lives earlier in game-5. On mobile, later interaction layers can
   consume the same tap before the delegated handler completes. Own the two
   Forge-upgrade actions here so a valid tap always opens the confirmation and
   the confirmation always starts the upgrade. */
function forgeUpgradeResult383(r){
  try{
    if(typeof toast!=='function')return;
    if(r&&r.ok)toast(r.instant?'Forge améliorée !':'Amélioration lancée',true);
    else toast(r&&r.reason==='gold'?'Or insuffisant':r&&r.reason==='max'?'Forge au maximum':r&&r.reason==='busy'?'Amélioration en cours':"Impossible d'améliorer la Forge");
  }catch(_){}
}
document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('[data-act="forgeUpgradeAsk"],[data-act="forgeUpgrade"]'):null;
  if(!b)return;
  if(b.disabled||b.getAttribute('aria-disabled')==='true')return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if(b.getAttribute('data-act')==='forgeUpgradeAsk'){
    try{
      if(typeof showForgeUpgrade==='function'){showForgeUpgrade();return;}
    }catch(err){try{console.error('Forge upgrade sheet failed',err);}catch(_){}}
  }
  try{
    if(typeof closeModal==='function')closeModal();
    var r=typeof upgradeForge==='function'?upgradeForge():{ok:false,reason:'missing'};
    forgeUpgradeResult383(r);
    if(typeof scheduleRender==='function')scheduleRender();
    else if(typeof render==='function')render();
  }catch(err){
    try{console.error('Forge upgrade tap failed',err);}catch(_){}
    forgeUpgradeResult383({ok:false,reason:'error'});
  }
},true);
var st=document.createElement('style');st.id='srForgePanelAuthorityV266Style';st.textContent='\
.srForgePanel266{position:relative;box-sizing:border-box!important;padding:5px 7px 5px!important;overflow:visible!important}.srForgeLifetime445{margin-top:3px;padding:4px 6px;border:1px solid #735f2f;border-radius:8px;background:linear-gradient(180deg,#1a1720,#0d1320);box-sizing:border-box}.srForgeLifetimeTop445,.srForgeLifetimeMeta445{display:flex;align-items:center;justify-content:space-between;gap:6px}.srForgeLifetimeTop445 b{font:900 8.5px/1 Georgia,serif;color:var(--goldLit);letter-spacing:.35px}.srForgeLifetimeTop445 span{font:900 8.5px/1 system-ui;color:#9ef2f8}.srForgeLifetimeBar445{height:3px;margin-top:4px;border-radius:99px;background:#0a0f19;overflow:hidden}.srForgeLifetimeBar445 i{display:block;height:100%;background:linear-gradient(90deg,#6d5c2c,#f5c542);border-radius:99px}.srForgeLifetimeMeta445{margin-top:3px;color:var(--dim);font:800 7.5px/1 system-ui}.srForgeHead266{display:flex;align-items:center;justify-content:space-between;gap:7px;height:24px;flex:0 0 24px}.srForgeHeadLeft266,.srForgeMineral266{display:flex;align-items:center;gap:5px}.srForgeHeadLeft266>b{font:900 11px/1 Georgia,serif;color:var(--goldLit);letter-spacing:.4px;white-space:nowrap}.srForgeHammer266{width:21px;height:21px;border:1px solid var(--goldDim);border-radius:7px;display:grid;place-items:center}.srForgeMineral266{color:var(--blueLit);font-size:10px;white-space:nowrap}.srForgeUpgrade266{position:relative;margin-top:3px;min-height:31px;flex:0 0 31px;border:1px solid #314762;border-radius:9px;background:#0b1525;padding:3px 6px;display:flex;align-items:center;gap:6px;box-sizing:border-box}.srForgeUpgrade266.max{justify-content:center;color:var(--greenLit);min-height:27px;flex-basis:27px}.srForgeUpText266{display:flex;flex-direction:column;gap:1px;min-width:0}.srForgeUpText266>b,.srForgeUpLine266 b{font-size:8.5px;color:var(--goldLit)}.srForgeUpLine266{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:8.5px;color:var(--goldLit)}.srForgeSpeedBtn266{height:24px;min-width:64px;border:1px solid #2e7186;border-radius:8px;background:linear-gradient(180deg,#102a38,#0a1c27);color:#aaf1fb;display:flex;align-items:center;justify-content:center;gap:3px;font:900 8.5px system-ui;flex:0 0 auto}.srForgeSpeedBtn266.open{border-color:#55d9e3;box-shadow:0 0 0 1px #55d9e344 inset}.srForgeSpeedPop266{display:none;position:absolute;z-index:120;left:5px;right:5px;top:calc(100% + 3px);border:1px solid #2e7186;border-radius:10px;background:#071521f7;box-shadow:0 10px 28px #000c;padding:7px}.srForgeSpeedPop266.open{display:block}.srForgeSpeedPopHead266{display:flex;align-items:center;justify-content:space-between;color:#aaf1fb;font-size:9px;margin-bottom:5px}.srForgeSpeedClose266{width:24px;height:24px;border:1px solid #3b5873;border-radius:7px;background:#101c2b;color:#d7e7f8;font-weight:900}.srForgeSpeedList266{display:flex;gap:5px;overflow-x:auto}.srForgeSpeedChip266{flex:0 0 auto;border:1px solid #3fcfd6;border-radius:999px;background:#0c1e2b;color:#9ef2f8;padding:6px 9px;font:800 9px system-ui}.srForgeLootReserve266{height:auto!important;min-height:66px!important;max-height:none!important;margin-top:3px;flex:1 1 auto!important;overflow:visible;min-width:0}.srForgeActions266{display:flex;align-items:stretch;gap:5px;margin-top:3px;height:37px;flex:0 0 37px}.srForgeActions266>.btn{min-height:37px!important;height:37px!important}.srForgeActionLabel266,.srForgeBatchLabel266{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;line-height:1}.srForgeActionLabel266 small,.srForgeBatchLabel266 small{font-size:7px;opacity:.8;display:flex;gap:2px;align-items:center}.srForgeActions266 .tgl{flex:0 0 88px;min-width:88px;height:37px!important}.srForgeAuto266.on span{color:#78e996;font-size:8px}.srForgeFilter266{margin-top:3px!important;height:25px!important;min-height:25px!important;max-height:25px!important;padding:2px 6px!important;flex:0 0 25px;box-sizing:border-box!important}.srForgeFilter266 .pill{font-size:7px!important;padding:2px 5px!important}@media(max-width:390px){.srForgePanel266{padding-left:6px!important;padding-right:6px!important}.srForgeHeadLeft266>b{font-size:10.5px}.srForgeLootReserve266{min-height:60px!important}.srForgeActions266{height:35px;flex-basis:35px}.srForgeActions266>.btn,.srForgeActions266 .tgl{height:35px!important;min-height:35px!important}.srForgeActions266 .tgl{flex-basis:82px;min-width:82px}.srForgeSpeedBtn266{min-width:58px}.srForgeFilter266{height:24px!important;min-height:24px!important;max-height:24px!important;flex-basis:24px}}@media(max-height:720px){.srForgeLootReserve266{min-height:52px!important}.srForgeUpgrade266{min-height:29px;flex-basis:29px}.srForgeActions266{height:34px;flex-basis:34px}.srForgeActions266>.btn,.srForgeActions266 .tgl{height:34px!important;min-height:34px!important}.srForgeFilter266{height:23px!important;min-height:23px!important;max-height:23px!important;flex-basis:23px}}@media(prefers-reduced-motion:reduce){.srForgeSpeedBtn266{transition:none!important}}';document.head.appendChild(st);

/* V384 · Mobile Forge layout repair
   Keep Speed fully above the action row, give the three forge actions stable
   columns, and let the discard filter breathe on its own row. */
try{
  var layout384=document.getElementById('srForgeMobileLayoutV384Style')||document.createElement('style');
  layout384.id='srForgeMobileLayoutV384Style';
  layout384.textContent='\
#homeForge.srForgePanel266{padding-bottom:8px!important;overflow:visible!important}\
#homeForge.srForgePanel266 .srForgeUpgrade266.running{min-height:40px!important;height:40px!important;flex:0 0 40px!important;padding:5px 94px 5px 8px!important;overflow:visible!important;z-index:6!important}\
#homeForge.srForgePanel266 .srForgeUpgrade266.running .srForgeUpText266{width:100%!important;min-width:0!important}\
#homeForge.srForgePanel266 .srForgeUpgrade266.running .srForgeSpeedBtn266{position:absolute!important;right:7px!important;top:6px!important;bottom:auto!important;width:80px!important;min-width:80px!important;height:28px!important;min-height:28px!important;margin:0!important;padding:0 8px!important;z-index:8!important;box-sizing:border-box!important}\
#homeForge.srForgePanel266 .srForgeUpgrade266.running .srForgeSpeedPop266{top:calc(100% + 5px)!important;left:6px!important;right:6px!important;z-index:140!important}\
#homeForge.srForgePanel266 .srForgeLootReserve266{min-height:56px!important}\
#homeForge.srForgePanel266 .srForgeActions266{display:grid!important;grid-template-columns:minmax(0,1fr) 76px 92px!important;align-items:stretch!important;gap:7px!important;margin-top:7px!important;height:42px!important;min-height:42px!important;flex:0 0 42px!important;position:relative!important;z-index:3!important}\
#homeForge.srForgePanel266 .srForgeActions266>.btn{width:100%!important;min-width:0!important;max-width:none!important;height:42px!important;min-height:42px!important;flex:none!important;margin:0!important;box-sizing:border-box!important}\
#homeForge.srForgePanel266 .srForgeActions266 .tgl{width:100%!important;min-width:0!important;max-width:none!important;height:42px!important;min-height:42px!important;flex:none!important;margin:0!important;box-sizing:border-box!important}\
#homeForge.srForgePanel266 .srForgeFilter266{display:flex!important;align-items:center!important;gap:7px!important;margin-top:8px!important;height:auto!important;min-height:35px!important;max-height:none!important;padding:6px 9px!important;flex:0 0 auto!important;box-sizing:border-box!important;position:relative!important;z-index:2!important}\
#homeForge.srForgePanel266 .srForgeFilter266>.flex1{min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:9px!important;line-height:1.15!important}\
#homeForge.srForgePanel266 .srForgeFilter266 .pill{flex:0 0 auto!important;font-size:8px!important;line-height:1!important;padding:4px 7px!important;margin-left:2px!important}\
@media(max-width:390px){\
#homeForge.srForgePanel266 .srForgeUpgrade266.running{padding-right:88px!important}\
#homeForge.srForgePanel266 .srForgeUpgrade266.running .srForgeSpeedBtn266{right:6px!important;width:74px!important;min-width:74px!important}\
#homeForge.srForgePanel266 .srForgeLootReserve266{min-height:52px!important}\
#homeForge.srForgePanel266 .srForgeActions266{grid-template-columns:minmax(0,1fr) 68px 86px!important;gap:6px!important;height:40px!important;min-height:40px!important;flex-basis:40px!important}\
#homeForge.srForgePanel266 .srForgeActions266>.btn,#homeForge.srForgePanel266 .srForgeActions266 .tgl{height:40px!important;min-height:40px!important}\
#homeForge.srForgePanel266 .srForgeFilter266{margin-top:7px!important;min-height:34px!important;padding:6px 8px!important}\
}\
@media(max-height:720px){\
#homeForge.srForgePanel266 .srForgeLootReserve266{min-height:46px!important}\
#homeForge.srForgePanel266 .srForgeActions266{margin-top:5px!important;height:38px!important;min-height:38px!important;flex-basis:38px!important}\
#homeForge.srForgePanel266 .srForgeActions266>.btn,#homeForge.srForgePanel266 .srForgeActions266 .tgl{height:38px!important;min-height:38px!important}\
#homeForge.srForgePanel266 .srForgeFilter266{margin-top:6px!important;min-height:32px!important;padding-top:5px!important;padding-bottom:5px!important}\
}';
  if(!layout384.parentNode)document.head.appendChild(layout384);
  window.__srForgeMobileLayoutV384=true;
}catch(_){}

/* V458 · Compact Home Forge geometry + organized Auto-Forge/filter sheet.
   The fixed Home Forge lane was created before the mastery row existed; the
   accumulated rows could push the filter below the lane's clipped bottom.
   Keep every control in-flow and make only the rarity list scroll inside the modal. */
try{
  var layout458=document.getElementById('srForgeFilterLayoutV458Style')||document.createElement('style');
  layout458.id='srForgeFilterLayoutV458Style';
  layout458.textContent='\
#homeForge.srForgePanel266{padding:4px 7px 6px!important;display:flex!important;flex-direction:column!important;min-height:0!important}\
#homeForge.srForgePanel266 .srForgeHead266{height:22px!important;flex:0 0 22px!important}\
#homeForge.srForgePanel266 .srForgeLifetime445{margin-top:2px!important;padding:3px 6px!important;flex:0 0 auto!important}\
#homeForge.srForgePanel266 .srForgeLifetimeBar445{height:2px!important;margin-top:3px!important}\
#homeForge.srForgePanel266 .srForgeLifetimeMeta445{margin-top:2px!important}\
#homeForge.srForgePanel266 .srForgeUpgrade266{margin-top:2px!important;min-height:28px!important;flex:0 0 28px!important;padding-top:2px!important;padding-bottom:2px!important}\
#homeForge.srForgePanel266 .srForgeLootReserve266{margin-top:2px!important;min-height:58px!important;height:58px!important;flex:0 0 58px!important;overflow:hidden!important}\
#homeForge.srForgePanel266 .srForgeLootReserve266 #srForgeLoot273{height:58px!important;max-height:58px!important}\
#homeForge.srForgePanel266 .srForgeActions266{margin-top:4px!important;height:38px!important;min-height:38px!important;flex:0 0 38px!important;gap:6px!important}\
#homeForge.srForgePanel266 .srForgeActions266>.btn,#homeForge.srForgePanel266 .srForgeActions266 .tgl{height:38px!important;min-height:38px!important}\
#homeForge.srForgePanel266 .srForgeFilter266{display:flex!important;visibility:visible!important;opacity:1!important;margin-top:4px!important;height:30px!important;min-height:30px!important;max-height:30px!important;flex:0 0 30px!important;padding:4px 8px!important;border-color:#684fa3!important;background:linear-gradient(180deg,#18142a,#0f1220)!important}\
#homeForge.srForgePanel266 .srForgeFilter266>.flex1{font-size:8.5px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}\
#homeForge.srForgePanel266 .srForgeFilter266 .pill{font-size:7.5px!important;padding:3px 6px!important}\
#overlay>.card>.mbody:has(.srForgeFilterModal458){padding:10px 10px 9px!important;overflow:hidden!important}\
.srForgeFilterModal458{display:flex;flex-direction:column;gap:8px;max-height:calc(88vh - 96px);min-height:0;overflow-y:auto;overscroll-behavior:contain;padding-right:2px;scrollbar-width:thin}\
.srForgeFilterSection458{border:1px solid #2e4668;border-radius:11px;background:linear-gradient(180deg,#111c2f,#0a1424);padding:8px;box-sizing:border-box}\
.srForgeFilterSection458.auto{border-color:#386b59;background:linear-gradient(180deg,#10251f,#0a1718)}\
.srForgeFilterSection458.filter{border-color:#5c477c}\
.srForgeFilterSectionHead458{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}\
.srForgeFilterSectionHead458>div{min-width:0}.srForgeFilterSectionHead458 b{display:block;font:900 10px/1.1 Georgia,serif;letter-spacing:.55px;color:var(--goldLit)}\
.srForgeFilterSectionHead458 small{display:block;margin-top:2px;font:700 8px/1.15 system-ui;color:var(--textDim)}\
.srForgeAutoTop458{display:grid;grid-template-columns:1fr 1fr;gap:6px;align-items:stretch}\
.srForgeAutoTop458 .tgl{width:100%!important;min-width:0!important;height:34px!important;min-height:34px!important;box-sizing:border-box!important}\
.srForgeAutoCycle458{height:34px;border:1px solid #31556e;border-radius:9px;background:#0b1827;padding:4px 8px;display:flex;align-items:center;justify-content:space-between;gap:7px;box-sizing:border-box}\
.srForgeAutoCycle458 span{font-size:8px;font-weight:800;color:var(--textDim)}.srForgeAutoCycle458 b{font-size:12px;color:#8feff4}\
.srAutoBatch458{margin-top:6px!important;padding:0!important;border:0!important;background:transparent!important}\
.srAutoBatch458 .srBatchBtns266{margin-top:0!important}.srAutoBatch458 .srBatchGateNote266{margin-top:4px!important;font-size:7.5px!important}\
.srForgeFilterActions458{display:grid;grid-template-columns:1fr 1fr;gap:6px}.srForgeFilterActions458>.btn{width:100%!important;min-width:0!important}\
.srForgeFilterHint458{margin-top:6px;padding:5px 7px;border-radius:8px;background:#0a1120;border:1px solid #202f48;color:var(--textDim);font-size:7.8px;line-height:1.3}\
.srForgeRarityGrid458{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin-top:7px}\
.srForgeRarity458{appearance:none;min-width:0;min-height:39px;border:1px solid color-mix(in srgb,var(--rc) 42%,#31425d);border-left:3px solid var(--rc);border-radius:9px;background:#0b1423;color:var(--text);padding:5px 6px;display:grid;grid-template-columns:23px minmax(0,1fr) 18px;align-items:center;gap:5px;text-align:left;box-sizing:border-box}\
.srForgeRarity458.recycle{background:linear-gradient(180deg,#241322,#130e18);border-color:#7b405a}.srForgeRarity458.locked{opacity:.48}\
.srForgeRarityIcon458{width:22px;height:22px;border-radius:6px;border:1px solid color-mix(in srgb,var(--rc) 50%,#34455f);display:grid;place-items:center;color:var(--rc)}\
.srForgeRarityText458{min-width:0}.srForgeRarityText458 b{display:block;color:var(--rc);font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.srForgeRarityText458 small{display:block;margin-top:2px;color:var(--textDim);font-size:6.8px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.srForgeRarityState458{font-size:11px;font-weight:900;color:var(--greenLit);text-align:center}.srForgeRarity458.recycle .srForgeRarityState458{color:#ff8290}\
.srForgeFilterFooter458{position:sticky;bottom:-9px;z-index:4;margin:8px -10px -9px;padding:7px 10px 0;background:linear-gradient(180deg,transparent,#0a1220 30%)}\
.srForgeFilterFooter458>.btn{width:100%!important}\
@media(max-width:390px){.srForgeRarityGrid458{gap:4px}.srForgeRarity458{padding:4px 5px;grid-template-columns:21px minmax(0,1fr) 16px}.srForgeFilterSection458{padding:7px}.srForgeFilterModal458{gap:6px}}\
@media(max-height:700px){#homeForge.srForgePanel266 .srForgeLifetimeMeta445{display:none!important}#homeForge.srForgePanel266 .srForgeLootReserve266{min-height:52px!important;height:52px!important;flex-basis:52px!important}#homeForge.srForgePanel266 .srForgeLootReserve266 #srForgeLoot273{height:52px!important;max-height:52px!important}.srForgeFilterModal458{max-height:calc(86vh - 86px)}.srForgeRarity458{min-height:36px}}';
  if(!layout458.parentNode)document.head.appendChild(layout458);
}catch(_){}

try{if(typeof render==='function')render();}catch(_){}
window.__srForgePanelAuthorityV266={version:266,revision:458,build:forgeHTML,forgeLifetimeMasteryV445:true,filterLayoutV458:true};
})();