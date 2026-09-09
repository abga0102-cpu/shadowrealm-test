/* Shadowreach V240 — Familiers plein écran, sans pagination artificielle.
   - HUD global masqué uniquement dans Familiers.
   - Gemmes + Essence + Pommes regroupées dans l'en-tête Familiers.
   - Collection / Œufs / Progression / Plus : défilement vertical naturel indépendant.
   - Tous les familiers et œufs sont rendus dans leur onglet, sans pages 1/2.
   Aucun MutationObserver, aucun changement économie/sauvegarde/gameplay. */
(function(){
  'use strict';
  if(window.__srFamScrollLayoutV240)return;
  window.__srFamScrollLayoutV240=true;
  if(typeof SCREENS==='undefined'||!SCREENS)return;

  var tab='collection';

  function gemCount(){
    var keys=['gems','diamonds','diamants','premium','crystals','cristaux'];
    for(var i=0;i<keys.length;i++) if(Number.isFinite(Number(S[keys[i]]))) return Number(S[keys[i]]||0);
    return 0;
  }
  function eggArt(r){return ASSETS['egg_'+String(r||'commun').toLowerCase()];}
  function hpPct(p){return p?Math.round(petBonus(p)*(1+treeSum(S,'petHp')/100)):0;}
  function dmgPct(p){if(!p)return 0;var pct=petBonus(p)*(1+treeSum(S,'petHp')/100);return Math.round(pct*(1+treeSum(S,'petDmg')/100)*(petElement(p).id==='normal'?1.10:1));}
  function tabBtn(id,label,badge){return '<button class="fam240Tab '+(tab===id?'on':'')+'" data-fam240-tab="'+id+'">'+label+(badge!==''?'<span>'+badge+'</span>':'')+'</button>';}
  function petTile(p){
    var rc=RARITY[p.rarity].c,active=p.id===S.activePetId;
    return '<button class="fam240Pet '+(active?'active':'')+'" data-act="setPet" data-arg="'+esc(p.id)+'" style="--rc:'+rc+'">'+
      (active?'<i>ÉQUIPÉ</i>':'')+'<img src="'+petArt(p)+'" alt=""><b style="color:'+rc+'">'+esc(petSpecies(p).label)+'</b><small>Niv. '+(p.level||0)+'</small></button>';
  }
  function hatchCard(e,now){
    var rc=RARITY[e.rarity].c,art=eggArt(e.rarity),remain=(e.hatchEnd-now)/1000,ready=remain<=0;
    return '<div class="fam240HatchCard '+(ready?'ready':'')+'" style="--rc:'+rc+'">'+(art?'<img src="'+art+'" alt="">':ic('egg',26))+
      '<div><b style="color:'+rc+'">'+RARITY[e.rarity].label+'</b><small>'+(ready?'Prêt':fmtTime(remain))+'</small></div>'+
      (ready?btn('Récupérer',{small:true,cls:'green',act:'collectEgg',arg:e.id,style:'width:auto;padding:4px 7px;font-size:9px'}):'')+'</div>';
  }
  function storedEgg(e,full){
    var rc=RARITY[e.rarity].c,art=eggArt(e.rarity);
    return '<div class="fam240Stored" style="--rc:'+rc+'">'+(art?'<img src="'+art+'" alt="">':ic('egg',24))+
      '<b style="color:'+rc+'">'+RARITY[e.rarity].label+'</b><small>'+fmtTime(EGG_TIMERS[e.rarity]/hatchSpeedFor(S,e.rarity))+'</small>'+
      btn('Éclore',{small:true,cls:'green',act:'startEgg',arg:e.id,dis:full,style:'padding:4px 6px;font-size:9px'})+'</div>';
  }
  function accelRow(e){
    var items=(typeof ACCEL_DEFS!=='undefined'?ACCEL_DEFS:[]).filter(function(a){return(S.accels&&S.accels[a.key]||0)>0;});
    return '<div class="fam240Accel"><span style="color:'+RARITY[e.rarity].c+'">'+RARITY[e.rarity].label+' · '+fmtTime(Math.max(0,(e.hatchEnd-Date.now())/1000))+'</span><div>'+
      (items.length?items.map(function(a){return '<button class="fam240Pill" data-act="accel" data-arg="'+a.key+'" data-arg2="egg:'+e.id+'">'+ic('bolt',9)+a.label+' ×'+S.accels[a.key]+'</button>';}).join(''):'<small class="mute">Aucun accélérateur</small>')+'</div></div>';
  }

  function renderV240(){
    var now=Date.now();
    var active=(S.pets||[]).find(function(p){return p.id===S.activePetId;})||null;
    var hatching=eggsHatching(S),stored=eggsStored(S),ready=hatching.filter(function(e){return e.hatchEnd<=now;}).length;
    var pets=(S.pets||[]).slice().sort(function(a,b){return PET_RARITY_ORDER.indexOf(b.rarity)-PET_RARITY_ORDER.indexOf(a.rarity)||(b.level||0)-(a.level||0);});
    var mreq=masteryReq(S.petMastery.level);

    var resources='<div class="fam240Resources">'+
      '<span class="fam240Res gem">💎 <b>'+fmt(gemCount())+'</b></span>'+
      '<span class="fam240Res essence" data-act="resInfo" data-arg="essence">'+ic('essence',11)+' <b>'+fmt(S.essence)+'</b></span>'+
      '<span class="fam240Res apple" data-act="resInfo" data-arg="apples">🍎 <b>'+fmt(S.apples||0)+'</b></span></div>';

    var hero=active?'<div class="fam240Hero" style="--rc:'+RARITY[active.rarity].c+'"><img src="'+petArt(active)+'" alt=""><div class="fam240HeroInfo">'+
      '<small>ÉQUIPÉ</small><b>'+esc(petFullName(active))+'</b><span>Niv. '+(active.level||0)+' · '+RARITY[active.rarity].label+'</span></div>'+
      '<div class="fam240HeroStats"><b>'+ic('sword',11)+' '+dmgPct(active)+'%</b><b>'+ic('heart',11)+' '+hpPct(active)+'%</b></div></div>':
      '<div class="fam240Hero empty"><b>Aucun familier actif</b><span>Fais éclore un œuf puis équipe-le.</span></div>';

    var hatchBlock=hatching.length?'<section class="fam240Hatching"><div class="fam240SectionHead"><b>Œufs en éclosion</b><span>'+hatching.length+'/'+S.eggSlots+(ready?' · '+ready+' prêt'+(ready>1?'s':''):'')+'</span></div><div class="fam240HatchGrid">'+hatching.map(function(e){return hatchCard(e,now);}).join('')+'</div></section>':'';

    var collection='<div class="fam240Scroll"><div class="fam240Grid">'+(pets.length?pets.map(petTile).join(''):'<div class="fam240Empty">Aucun familier.</div>')+'</div><div class="fam240BottomSpace"></div></div>';
    var eggs='<div class="fam240Scroll"><div class="fam240StoredGrid">'+(stored.length?stored.map(function(e){return storedEgg(e,hatching.length>=S.eggSlots);}).join(''):'<div class="fam240Empty">Aucun œuf en stock.</div>')+'</div><div class="fam240BottomSpace"></div></div>';

    var progress='<div class="fam240Scroll"><div class="fam240Panel"><div class="between tiny b"><span>Maîtrise familier</span><span>'+S.petMastery.progress+'/'+mreq+'</span></div>'+meter((S.petMastery.progress/mreq)*100,'#FF7A3D',S.petMastery.progress+' / '+mreq)+
      '<div class="row gap6 mt8">'+btn(ic('egg',12)+' Invoquer · '+PET_SUMMON_COST,{small:true,act:'summonEgg',arg:1,dis:S.essence<PET_SUMMON_COST})+
      btn('x10 · '+(PET_SUMMON_COST*10),{small:true,act:'summonEgg',arg:10,dis:S.essence<PET_SUMMON_COST*10,style:'max-width:100px'})+'</div>'+
      '<button class="famRatesInfoBtn" data-fam-rates-open="1" aria-label="Voir les probabilités d’invocation"><span class="famRatesInfoIcon">i</span><span><b>Taux d’invocation</b><small>Voir les probabilités</small></span><em>›</em></button></div><div class="fam240BottomSpace"></div></div>';

    var activeH=hatching.filter(function(e){return e.hatchEnd>now;});
    var fusionR=PET_RARITY_ORDER.slice(0,-1);
    var utility='<div class="fam240Scroll"><div class="fam240Panel"><div class="fam240MiniHead">Accélérateurs</div>'+
      (activeH.length?activeH.map(accelRow).join(''):'<div class="fam240Empty compact">Aucune éclosion active.</div>')+
      '<div class="fam240MiniHead mt10">Fusion</div><div class="fam240Fusion">'+fusionR.map(function(r){var list=pets.filter(function(p){return p.rarity===r;}),need=petFuseNeed(r),can=list.length>=need;return '<div><span style="color:'+RARITY[r].c+'">'+RARITY[r].label+' '+list.length+'/'+need+'</span>'+btn('Fusion',{small:true,cls:can?'purple':'dark',act:'fuse',arg:r,dis:!can,style:'width:auto;padding:4px 8px;font-size:9px'})+'</div>';}).join('')+'</div></div><div class="fam240BottomSpace"></div></div>';

    var body=tab==='collection'?collection:tab==='eggs'?eggs:tab==='progress'?progress:utility;
    return topbar('Familiers',resources)+'<div class="famScroll240">'+hero+hatchBlock+'<div class="fam240Tabs">'+
      tabBtn('collection','Collection',pets.length)+tabBtn('eggs','Œufs',stored.length)+tabBtn('progress','Progression','')+tabBtn('utility','Plus','')+
      '</div><div class="fam240Body">'+body+'</div></div>';
  }

  SCREENS.familiers=renderV240;

  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-fam240-tab]');
    if(!t)return;
    tab=t.getAttribute('data-fam240-tab')||'collection';
    if(typeof render==='function')render();
  },true);

  var style=document.createElement('style');style.id='famScrollLayoutV240Style';style.textContent=`
#app:has(.famScroll240) #hud{display:none!important}
#screen:has(.famScroll240){display:flex!important;flex-direction:column!important;min-height:0!important;overflow:hidden!important}
#screen:has(.famScroll240)>#topbar{flex:0 0 auto!important}
.famScroll240{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;padding:6px 10px 0;gap:6px;overflow:hidden}
.fam240Resources{display:flex;align-items:center;gap:5px;flex-wrap:nowrap}.fam240Res{display:inline-flex;align-items:center;gap:3px;border:1px solid #334561;border-radius:999px;padding:4px 7px;background:#111b2c;font-size:9px;white-space:nowrap}.fam240Res.gem{color:#ff7ad9;border-color:#9a4d91}.fam240Res.essence{color:#ffc29b;border-color:#ff7a3d}.fam240Res.apple{color:#a9e06f;border-color:#6fa83c}
.fam240Hero{flex:0 0 auto;min-height:62px;border:1px solid var(--rc,#344765);border-radius:12px;background:linear-gradient(145deg,#17253c,#0d1626);display:grid;grid-template-columns:54px 1fr auto;align-items:center;gap:8px;padding:5px 8px}.fam240Hero>img{width:52px;height:52px;object-fit:contain}.fam240HeroInfo{min-width:0;display:flex;flex-direction:column}.fam240HeroInfo small{font-size:7px;color:var(--goldLit);font-weight:900}.fam240HeroInfo>b{font:900 12px var(--fd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fam240HeroInfo span{font-size:7.5px;color:var(--textMute)}.fam240HeroStats{display:flex;flex-direction:column;gap:2px;text-align:right;font-size:8.5px}.fam240HeroStats b:first-child{color:#ffb07c}.fam240HeroStats b:last-child{color:var(--redLit)}.fam240Hero.empty{display:flex;flex-direction:column;justify-content:center}.fam240Hero.empty span{font-size:8px;color:var(--textMute)}
.fam240Hatching{flex:0 0 auto}.fam240SectionHead{display:flex;justify-content:space-between;align-items:center;font-size:9px;color:var(--goldLit)}.fam240SectionHead span{font-size:7.5px;color:var(--textMute)}.fam240HatchGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin-top:3px;max-height:104px;overflow-y:auto;-webkit-overflow-scrolling:touch}.fam240HatchCard{height:46px;display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:4px;border:1px solid var(--rc);border-radius:9px;padding:3px 5px;background:#101a2c}.fam240HatchCard img{width:32px;height:32px;object-fit:contain}.fam240HatchCard div{display:flex;flex-direction:column;min-width:0}.fam240HatchCard b{font-size:8.5px}.fam240HatchCard small{font-size:7px;color:var(--textMute)}
.fam240Tabs{flex:0 0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;position:relative;z-index:3}.fam240Tab{border:1px solid #26344f;border-radius:9px;background:#101a2c;color:var(--textDim);padding:7px 3px;font:800 9px var(--fu)}.fam240Tab.on{border-color:var(--gold);color:var(--goldLit);background:#201a0f}.fam240Tab span{margin-left:3px;opacity:.72}
.fam240Body{flex:1 1 auto;min-height:0;overflow:hidden}.fam240Scroll{height:100%;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:2px 0 0;scrollbar-width:thin}.fam240Grid,.fam240StoredGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;align-content:start}.fam240Pet{position:relative;min-height:112px;border:1px solid var(--rc);border-radius:10px;background:linear-gradient(#17243b,#0d1626);padding:5px 3px;display:flex;flex-direction:column;align-items:center;justify-content:center}.fam240Pet.active{box-shadow:0 0 0 1px var(--gold)}.fam240Pet i{position:absolute;top:3px;left:3px;font-style:normal;font-size:6px;background:#1f7a43;color:#fff;border-radius:4px;padding:1px 3px}.fam240Pet img{width:58px;height:58px;max-width:72%;object-fit:contain}.fam240Pet b{font-size:8.5px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fam240Pet small,.fam240Stored small{font-size:7px;color:var(--textMute)}
.fam240Stored{min-height:114px;border:1px solid var(--rc);border-radius:10px;background:#101a2c;padding:5px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.fam240Stored img{width:52px;height:52px;object-fit:contain}.fam240Stored b{font-size:8.5px}.fam240Panel{border:1px solid #26344f;border-radius:11px;background:#0f1828;padding:10px}.fam240MiniHead{font:900 11px var(--fd);color:var(--goldLit)}.fam240Accel{border-bottom:1px solid #ffffff10;padding:8px 0}.fam240Accel>span{font-size:8.5px;font-weight:900}.fam240Accel>div{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}.fam240Pill{border:1px solid #36506e;border-radius:999px;background:#17233a;color:var(--text);padding:3px 6px;font-size:7.5px}.fam240Fusion{display:grid;gap:5px}.fam240Fusion>div{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #ffffff0d;padding:5px 0}.fam240Fusion span{font-size:8.5px;font-weight:900}.fam240Empty{grid-column:1/-1;text-align:center;color:var(--textMute);font-size:9px;padding:28px 8px}.fam240Empty.compact{padding:14px 8px}.fam240BottomSpace{height:18px}
@media(max-width:390px){.fam240Grid,.fam240StoredGrid{grid-template-columns:repeat(3,minmax(0,1fr))}.fam240Pet,.fam240Stored{min-height:104px}.fam240Pet img{width:52px;height:52px}}
@media(max-height:720px){.fam240Hero{min-height:56px;grid-template-columns:48px 1fr auto}.fam240Hero>img{width:46px;height:46px}.fam240HatchGrid{max-height:92px}.fam240Tab{padding:5px 2px}.fam240Pet,.fam240Stored{min-height:96px}}
`;
  document.head.appendChild(style);
})();