/* Shadowreach V229 — Familiar UX redesign. Visual/runtime override only. */
(function(){
  "use strict";

  const STYLE_ID = "sr-familiars-v229-style";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .famV229{padding-bottom:18px}
      .famV229 .famHero{position:relative;overflow:hidden;padding:0;border-color:#8a6522;background:linear-gradient(145deg,#17253c 0%,#101a2c 58%,#0b1220 100%)}
      .famV229 .famHero::before{content:"";position:absolute;inset:0;background:radial-gradient(90% 75% at 19% 25%,var(--famGlow,#4a90d9)22,transparent 66%);pointer-events:none}
      .famV229 .famHeroArt{width:42%;min-height:172px;display:flex;align-items:flex-end;justify-content:center;position:relative;z-index:1;background:linear-gradient(180deg,#0e1b3000,#07101eb8)}
      .famV229 .famHeroArt img{width:100%;max-height:168px;object-fit:contain;filter:drop-shadow(0 8px 16px #000c)}
      .famV229 .famHeroInfo{flex:1;padding:13px 12px 12px 2px;position:relative;z-index:1;min-width:0}
      .famV229 .famEquipped{position:absolute;top:8px;left:8px;z-index:2;padding:4px 8px;border-radius:8px;background:#1f7a43;color:#fff;font-size:9px;font-weight:900;border:1px solid #63d88b}
      .famV229 .famName{font-family:var(--fd);font-size:18px;font-weight:900;line-height:1.1;color:#f7f1e7;text-shadow:0 2px 0 #000}
      .famV229 .famBonusMain{margin-top:8px;padding:9px 10px;border-radius:10px;border:1px solid #4a6494;background:#0a1220aa}
      .famV229 .famBonusMain b{font-size:16px;color:#fff}
      .famV229 .famHeroActions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}
      .famV229 .famCompare{padding:9px 10px}
      .famV229 .famCompareGrid{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center}
      .famV229 .famComparePet{display:grid;grid-template-columns:44px 1fr;gap:7px;align-items:center;min-width:0}
      .famV229 .famComparePet img{width:44px;height:44px;object-fit:contain;filter:drop-shadow(0 3px 8px #000b)}
      .famV229 .famCollection{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
      .famV229 .famTile{position:relative;min-width:0;padding:7px 5px 8px;text-align:center;cursor:pointer;border:1px solid var(--rc,#2e4269);border-radius:11px;background:linear-gradient(180deg,#17243b,#0d1626);box-shadow:inset 0 1px 0 #ffffff16}
      .famV229 .famTile.active{box-shadow:0 0 0 1px var(--gold),0 0 13px #e8b44a55,inset 0 1px 0 #ffffff22}
      .famV229 .famTile img{width:54px;height:54px;object-fit:contain;filter:drop-shadow(0 4px 8px #000b)}
      .famV229 .famTileName{font-size:9px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .famV229 .famTileLv{font-size:8px;color:var(--textDim);margin-top:2px}
      .famV229 .famTileEq{position:absolute;top:4px;left:4px;padding:2px 4px;border-radius:5px;background:#1f7a43;color:white;font-size:7px;font-weight:900}
      .famV229 .famEggShelf{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
      .famV229 .famEgg{position:relative;text-align:center;padding:8px 5px;border:1px solid var(--rc,#2e4269);border-radius:11px;background:linear-gradient(180deg,#17243b,#0d1626);min-height:104px}
      .famV229 .famEgg img{width:46px;height:46px;object-fit:contain;filter:drop-shadow(0 4px 8px #000b)}
      .famV229 .famReady{box-shadow:0 0 0 1px #e8b44a,0 0 14px #e8b44a55}
      .famV229 details.famDetails{margin-top:8px;border:1px solid var(--border);border-radius:11px;background:#101a2c}
      .famV229 details.famDetails>summary{list-style:none;cursor:pointer;padding:10px 11px;font-weight:900;font-size:11px;color:var(--goldLit);display:flex;align-items:center;justify-content:space-between}
      .famV229 details.famDetails>summary::-webkit-details-marker{display:none}
      .famV229 details.famDetails>summary::after{content:"›";font-size:18px;transform:rotate(90deg);transition:transform .15s}
      .famV229 details.famDetails[open]>summary::after{transform:rotate(-90deg)}
      .famV229 .famDetailsBody{padding:0 10px 10px}
      .famV229 .famSectionHead{display:flex;align-items:center;justify-content:space-between;margin:14px 0 7px;font-family:var(--fd);font-weight:900;color:var(--goldLit);font-size:13px}
      .famV229 .famSubtle{font-family:var(--fu);font-size:8.5px;color:var(--textMute);font-weight:700}
      .famV229 .famResourceRow{display:flex;gap:5px;flex-wrap:wrap}
      @media(max-width:360px){
        .famV229 .famHeroArt{width:39%;min-height:150px}.famV229 .famHeroArt img{max-height:145px}
        .famV229 .famName{font-size:16px}.famV229 .famCollection,.famV229 .famEggShelf{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
    `;
    document.head.appendChild(style);
  }

  function eggArt(r){ return ASSETS["egg_" + String(r || "commun").toLowerCase()]; }
  function petPowerPct(p){
    if (!p) return 0;
    return Math.round(petBonus(p) * (1 + treeSum(S,"petDmg") / 100));
  }
  function bestAlternative(active){
    const others = (S.pets || []).filter(p => !active || p.id !== active.id);
    return others.sort((a,b) => (petPowerPct(b) - petPowerPct(a)) || ((b.level||0)-(a.level||0)))[0] || null;
  }
  function petMiniCard(p, label){
    if (!p) return '<div class="mute tiny">Aucun</div>';
    const rc = RARITY[p.rarity].c;
    return '<div class="famComparePet"><img src="'+petArt(p)+'" alt=""><div style="min-width:0">'+
      '<div class="famSubtle">'+esc(label)+'</div><div class="b small" style="color:'+rc+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(petFullName(p))+'</div>'+
      '<div class="tiny mute">Niv. '+(p.level||0)+' · '+RARITY[p.rarity].label+'</div>'+
      '<div class="tiny b mt3" style="color:#ffb07c">'+ic("sword",9)+' +'+petPowerPct(p)+'%</div></div></div>';
  }
  function collectionTile(p){
    const rc = RARITY[p.rarity].c;
    const active = p.id === S.activePetId;
    return '<button class="famTile'+(active?' active':'')+'" data-act="setPet" data-arg="'+esc(p.id)+'" style="--rc:'+rc+'" aria-label="Activer '+esc(petFullName(p))+'">'+
      (active?'<span class="famTileEq">ÉQUIPÉ</span>':'')+
      '<img src="'+petArt(p)+'" alt=""><div class="famTileName" style="color:'+rc+'">'+esc(petSpecies(p).label)+'</div>'+
      '<div class="famTileLv">Niv. '+(p.level||0)+' · '+RARITY[p.rarity].label+'</div>'+
      '<div class="tiny b" style="color:'+petElement(p).c+'">'+esc(petElement(p).label)+'</div></button>';
  }
  function storedEggCard(e, full){
    const rc = RARITY[e.rarity].c;
    const art = eggArt(e.rarity);
    return '<div class="famEgg" style="--rc:'+rc+'">'+(art?'<img src="'+art+'" alt="">':ic("egg",30))+
      '<div class="tiny b" style="color:'+rc+'">'+RARITY[e.rarity].label+'</div>'+
      '<div class="famSubtle">'+fmtTime(EGG_TIMERS[e.rarity]/hatchSpeedFor(S,e.rarity))+'</div>'+
      '<div class="mt6">'+btn("Éclore",{small:true,cls:"green",act:"startEgg",arg:e.id,dis:full,style:"padding:4px 6px;font-size:9px"})+'</div></div>';
  }
  function hatchingEggCard(e, now){
    if (!e) return '<div class="famEgg" style="opacity:.36">'+(eggArt("commun")?'<img src="'+eggArt("commun")+'" style="filter:grayscale(1)" alt="">':ic("egg",30))+'<div class="famSubtle">Emplacement vide</div></div>';
    const rc=RARITY[e.rarity].c, art=eggArt(e.rarity), remain=(e.hatchEnd-now)/1000, ready=remain<=0;
    return '<div class="famEgg'+(ready?' famReady':'')+'" style="--rc:'+rc+'">'+(art?'<img src="'+art+'" alt="">':ic("egg",30))+
      '<div class="tiny b" style="color:'+rc+'">'+RARITY[e.rarity].label+'</div>'+
      (ready?'<div class="mt6">'+btn("Récupérer",{small:true,cls:"green",act:"collectEgg",arg:e.id,style:"padding:4px 6px;font-size:9px"})+'</div>':'<div class="tiny b mt4" style="color:var(--goldLit)">'+ic("clock",9)+' '+fmtTime(remain)+'</div>')+'</div>';
  }

  function renderFamiliarsV229(){
    const now=Date.now();
    const active=(S.pets||[]).find(p=>p.id===S.activePetId)||null;
    const alt=bestAlternative(active);
    const stored=eggsStored(S), hatching=eggsHatching(S);
    const mreq=masteryReq(S.petMastery.level);
    const rates=getRates("pet",S.petMastery.level,S.ascension,starsOf(S,"pet"));
    const ORANGE="#FF7A3D";
    const treeDmg=treeSum(S,"petDmg");

    let hero;
    if (!active) {
      hero='<div class="card frame famHero center" style="padding:20px 14px"><div style="font-size:34px;opacity:.45">'+ic("paw",34)+'</div><div class="bb gt mt8">Aucun familier équipé</div><div class="mute small mt6">Fais éclore un œuf puis choisis ton premier compagnon.</div>'+
        (S.pets.length?'<div class="mt10"><button class="btn blue sm" data-fam-jump="collection">Choisir un familier</button></div>':'')+'</div>';
    } else {
      const rc=RARITY[active.rarity].c, lv=active.level||0, mx=petMaxLevel(active.rarity), pct=petBonus(active), dmg=petPowerPct(active), cost=petUpgradeCost(active.rarity,lv);
      hero='<div class="card frame famHero" style="--famGlow:'+rc+'"><span class="famEquipped">ÉQUIPÉ</span><div class="row" style="align-items:stretch">'+
        '<div class="famHeroArt"><img src="'+petArt(active)+'" alt=""></div><div class="famHeroInfo">'+
        '<div class="famName">'+esc(petFullName(active))+'</div><div class="row gap4 mt6" style="flex-wrap:wrap">'+rtag(active.rarity)+'<span class="pill">Niv. '+lv+'/'+mx+'</span></div>'+
        '<div class="famBonusMain"><div class="famSubtle">BONUS PRINCIPAL</div><b>'+ic("sword",14)+' +'+dmg+'% dégâts</b><div class="tiny" style="color:var(--redLit);margin-top:3px">'+ic("heart",10)+' +'+Math.round(pct)+'% PV</div></div>'+
        '<div class="tiny b mt6" style="color:'+petElement(active).c+'">'+ic(petElement(active).icon,10)+' '+esc(petElement(active).desc)+'</div>'+
        '<div class="famHeroActions">'+
          (lv<mx?btn("🍎 Améliorer · "+fmt(cost),{small:true,act:"upgradePet",arg:active.id,dis:(S.apples||0)<cost,style:"padding:6px 7px;font-size:9.5px"}):'<span class="pill center" style="padding:7px 4px;color:var(--greenLit);border-color:#3FB950">NIV. MAX</span>')+
          '<button class="btn blue sm" data-fam-jump="collection" style="padding:6px 7px;font-size:9.5px">Changer</button></div></div></div></div>';
    }

    let compare='';
    if (active && alt) {
      const diff=petPowerPct(alt)-petPowerPct(active);
      compare='<div class="card famCompare mt8"><div class="between"><div class="bb gt" style="font-size:11px">COMPARAISON</div><span class="famSubtle">'+(diff>0?'+'+diff+'% dégâts potentiels':diff===0?'Puissance équivalente':Math.abs(diff)+'% dégâts en moins')+'</span></div><div class="famCompareGrid mt6">'+petMiniCard(active,"Actuel")+'<div style="color:var(--goldLit)">'+ic("chevron",18)+'</div>'+petMiniCard(alt,"Alternative")+'</div>'+
        '<div class="mt6">'+btn("Équiper "+petSpecies(alt).label,{small:true,cls:diff>0?"green":"ghost",act:"setPet",arg:alt.id,style:"padding:5px 8px;font-size:9.5px"})+'</div></div>';
    }

    const readyCount=hatching.filter(e=>e.hatchEnd<=now).length;
    const stockCards=stored.length?stored.map(e=>storedEggCard(e,hatching.length>=S.eggSlots)).join(''):'<div class="mute tiny" style="grid-column:1/-1;text-align:center;padding:10px">Aucun œuf en stock.</div>';
    let hatchCards='';
    for(let i=0;i<S.eggSlots;i++) hatchCards+=hatchingEggCard(hatching[i],now);

    const fusionRows=PET_RARITY_ORDER.slice(0,-1).map((r,i)=>{
      const list=(S.pets||[]).filter(p=>p.rarity===r), need=petFuseNeed(r), can=list.length>=need, next=PET_RARITY_ORDER[i+1];
      return '<div class="between gap8" style="padding:6px 0;border-bottom:1px solid #ffffff0b"><div class="tiny"><b style="color:'+RARITY[r].c+'">'+RARITY[r].label+' ×'+list.length+'</b><div class="mute">'+need+' → 1 '+RARITY[next].label+'</div></div>'+btn("Fusion",{small:true,cls:can?"purple":"dark",act:"fuse",arg:r,dis:!can,style:"width:auto;padding:4px 8px;font-size:9px"})+'</div>';
    }).join('');

    return topbar("Familiers",'<div class="famResourceRow"><span class="pill" data-act="resInfo" data-arg="essence" style="cursor:pointer;color:#FFC29B;border-color:'+ORANGE+'">'+ic("essence",11)+fmt(S.essence)+'</span><span class="pill" data-act="resInfo" data-arg="apples" style="cursor:pointer;color:#A9E06F;border-color:#6FA83C">🍎 '+fmt(S.apples||0)+'</span></div>')+
      '<div class="pad mt6 famV229">'+hero+compare+
      '<div id="famCollectionV229" class="famSectionHead"><span>Mes familiers ('+S.pets.length+')</span><span class="famSubtle">Appuie pour équiper</span></div>'+
      (S.pets.length?'<div class="famCollection">'+S.pets.slice().sort((a,b)=>PET_RARITY_ORDER.indexOf(b.rarity)-PET_RARITY_ORDER.indexOf(a.rarity)||(b.level||0)-(a.level||0)).map(collectionTile).join('')+'</div>':'<div class="mute tiny center">Aucun familier. Fais éclore un œuf.</div>')+
      '<div class="famSectionHead"><span>Œufs stockés ('+stored.length+')</span>'+(readyCount?'<span class="pill" style="color:var(--goldLit);border-color:var(--goldDim)">'+readyCount+' prêt'+(readyCount>1?'s':'')+' à éclore</span>':'<span class="famSubtle">Choisis quand les lancer</span>')+'</div>'+
      '<div class="famEggShelf">'+stockCards+'</div>'+
      '<div class="famSectionHead"><span>Éclosion ('+hatching.length+'/'+S.eggSlots+')</span><span class="famSubtle">Progression en temps réel</span></div><div class="famEggShelf">'+hatchCards+'</div>'+
      (!S.eggSlotGemBought&&S.eggSlots<RULES.EGG_SLOT_MAX?'<div class="mt8">'+btn("+1 emplacement · "+ic("gem",12)+"300",{small:true,cls:"purple",act:"buyEggSlot",dis:S.level<10||S.gems<300})+'</div>':'')+
      '<details class="famDetails"><summary>Maîtrise & invocations <span class="famSubtle">'+S.petMastery.level+'/'+RULES.MASTERY_MAX+'</span></summary><div class="famDetailsBody">'+
        '<div class="between tiny b"><span class="mute">MAÎTRISE FAMILIER</span><span style="color:#FFC29B">'+S.petMastery.progress+'/'+mreq+'</span></div>'+meter((S.petMastery.progress/mreq)*100,ORANGE,S.petMastery.progress+' / '+mreq)+ascendCta("pet")+
        '<div class="mt8">'+ratesTable(rates,S.petMastery.level<RULES.MASTERY_MAX?getRates("pet",S.petMastery.level+1,S.ascension,starsOf(S,"pet")):null,"Actuel","Niv."+(S.petMastery.level+1),PET_RARITY_ORDER)+'</div>'+
        '<div class="row gap6 mt8">'+btn(ic("egg",13)+" Invoquer · "+PET_SUMMON_COST,{small:true,act:"summonEgg",arg:1,dis:S.essence<PET_SUMMON_COST})+btn("x10 · "+(PET_SUMMON_COST*10),{small:true,act:"summonEgg",arg:10,dis:S.essence<PET_SUMMON_COST*10,style:"max-width:86px"})+'</div></div></details>'+
      '<details class="famDetails"><summary>Fusion & progression <span class="famSubtle">Secondaire</span></summary><div class="famDetailsBody"><div class="mute tiny" style="line-height:1.45">Les doublons servent à monter de rareté. Le familier le plus avancé conserve son niveau, son espèce, son élément et ses Pommes investies.</div>'+fusionRows+(treeDmg>0?'<div class="tiny b mt8" style="color:#8FEFF4">'+ic("bolt",10)+' Arbre : +'+treeDmg+'% aux dégâts des Familiers</div>':'')+'</div></details>'+
      '</div>';
  }

  if (typeof scrFamiliers === "function") {
    scrFamiliers = renderFamiliarsV229;
  }

  document.addEventListener("click",function(e){
    const t=e.target.closest && e.target.closest("[data-fam-jump]");
    if(!t) return;
    const id=t.getAttribute("data-fam-jump")==="collection"?"famCollectionV229":t.getAttribute("data-fam-jump");
    const el=document.getElementById(id);
    if(el) el.scrollIntoView({behavior:"smooth",block:"start"});
  },true);
})();
