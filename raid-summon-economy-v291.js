/* SHADOWREACH V291 · Skill/Familiar summon economy authority
   Raid reward authority:
   - Raid Compétence: 250 at lvl1, +10 per level.
   - Raid Familier:   350 Essence at lvl1, +5 per level (V335).
   V335 also compensates the guaranteed first-clear shortfall for already
   completed Raid Familier levels, once per save, without charging back levels
   where the previous V291 curve paid more.
   V322A changes only the PAID Familiar invocation price from 25 to 50 Essence.
   Tree Double Œuf stays a free extra result and never pays a second 50 Essence.
   Skill costs, raid keys and all other raids remain unchanged. */
(function(){
  'use strict';
  if(window.__srRaidSummonEconomyV291)return;
  window.__srRaidSummonEconomyV291=true;

  var FAMILIAR_SUMMON_COST_V322A=50;
  var COMPETENCE_RAID_BASE=250;
  var COMPETENCE_RAID_PER_LEVEL=10;
  var FAMILIAR_RAID_PREVIOUS_BASE=250;
  var FAMILIAR_RAID_PREVIOUS_PER_LEVEL=10;
  var FAMILIAR_RAID_BASE_V335=350;
  var FAMILIAR_RAID_PER_LEVEL_V335=5;
  var FAMILIAR_COMP_MARKER='raidFamilierEssenceCompensationV335';

  function normalizedLevel(level){
    return Math.max(1,Math.floor(Number(level)||1));
  }
  function competenceRaidReward(level){
    level=normalizedLevel(level);
    return COMPETENCE_RAID_BASE+COMPETENCE_RAID_PER_LEVEL*(level-1);
  }
  function familiarRaidReward(level){
    level=normalizedLevel(level);
    return FAMILIAR_RAID_BASE_V335+FAMILIAR_RAID_PER_LEVEL_V335*(level-1);
  }
  function previousFamiliarRaidReward(level){
    level=normalizedLevel(level);
    return FAMILIAR_RAID_PREVIOUS_BASE+FAMILIAR_RAID_PREVIOUS_PER_LEVEL*(level-1);
  }

  function compensateFamiliarRaidEssenceV335(s){
    if(!s||typeof s!=='object')return {changed:false,paid:0,record:0};
    var existing=s[FAMILIAR_COMP_MARKER];
    if(existing&&existing.processed)return {changed:false,paid:0,record:Math.max(0,Number(existing.record)||0)};

    var record=0;
    try{record=Math.max(0,Math.floor(Number(s.raids&&s.raids.familier&&s.raids.familier.record)||0));}catch(_){ }
    var paid=0;
    for(var level=1;level<=record;level++){
      var delta=familiarRaidReward(level)-previousFamiliarRaidReward(level);
      if(delta>0)paid+=delta;
    }
    if(paid>0)s.essence=(Number(s.essence)||0)+paid;
    s[FAMILIAR_COMP_MARKER]={processed:true,paid:paid,record:record,at:Date.now()};
    return {changed:true,paid:paid,record:record};
  }

  function compensateCurrentFamiliarRaidEssenceV335(){
    try{
      if(typeof S==='undefined'||!S)return false;
      var result=compensateFamiliarRaidEssenceV335(S);
      if(!result.changed)return false;
      try{if(typeof dirty!=='undefined')dirty=true;}catch(_){ }
      try{if(typeof saveNow==='function')saveNow();}catch(_){ }
      try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }
      if(result.paid>0){
        try{if(typeof toast==='function')toast('Compensation Raid Familier : +'+result.paid+' Essence',true);}catch(_){ }
      }
      return true;
    }catch(_){return false;}
  }

  try{
    if(typeof raidReward==='function'&&!raidReward.__srV291){
      var previousRaidReward=raidReward;
      var wrappedReward=function(type,level){
        if(type==='competence')return competenceRaidReward(level);
        if(type==='familier')return familiarRaidReward(level);
        return previousRaidReward.apply(this,arguments);
      };
      wrappedReward.__srV291=true;
      wrappedReward.__srPrevious=previousRaidReward;
      raidReward=wrappedReward;
    }
  }catch(_){ }

  /* Imported saves pass through the global migrate(...) lifecycle. Chain the
     V335 make-good there so an old exported save receives the same one-time
     compensation before it becomes the active state. Later import authorities
     wrap this function and therefore preserve this migration. */
  try{
    if(typeof migrate==='function'&&!migrate.__srRaidFamilierEssenceV335){
      var previousMigrateV335=migrate;
      var wrappedMigrateV335=function(){
        var migrated=previousMigrateV335.apply(this,arguments);
        try{compensateFamiliarRaidEssenceV335(migrated);}catch(_){ }
        return migrated;
      };
      wrappedMigrateV335.__srRaidFamilierEssenceV335=true;
      wrappedMigrateV335.__srPrevious=previousMigrateV335;
      migrate=wrappedMigrateV335;
    }
  }catch(_){ }

  /* Keep the original summon implementation as the single owner of rarity,
     mastery, storage and Double Œuf. V322A only guarantees that each PAID
     summon consumes exactly 50 Essence. The core still charges its legacy
     amount, so we measure what it actually consumed and top up only the
     missing delta. This also stays safe if the core cost is raised later. */
  try{
    if(typeof summonEgg==='function'&&!summonEgg.__srV322A){
      var previousSummonEgg=summonEgg;
      var wrappedSummonEgg=function(n){
        n=Math.max(0,Math.floor(Number(n)||0));
        if(!n)return [];
        var available=0;
        try{available=Math.max(0,Number(S&&S.essence)||0);}catch(_){ }
        var affordable=Math.floor(available/FAMILIAR_SUMMON_COST_V322A);
        var requested=Math.min(n,affordable);
        if(requested<=0)return [];

        var masteryBefore=0;
        try{masteryBefore=Math.max(0,Number(S&&S.petMastery&&S.petMastery.count)||0);}catch(_){ }
        var results=previousSummonEgg.call(this,requested);
        var essenceAfterOriginal=available;
        try{essenceAfterOriginal=Math.max(0,Number(S&&S.essence)||0);}catch(_){ }
        var masteryAfter=masteryBefore;
        try{masteryAfter=Math.max(masteryBefore,Number(S&&S.petMastery&&S.petMastery.count)||0);}catch(_){ }

        var paidFromMastery=Math.max(0,masteryAfter-masteryBefore);
        var paidFromResults=0;
        try{
          if(Array.isArray(results)){
            for(var i=0;i<results.length;i++)if(!results[i]||results[i].free!==true)paidFromResults+=1;
          }
        }catch(_){ }
        var paid=Math.max(paidFromMastery,Math.min(requested,paidFromResults));
        if(paid<=0&&Array.isArray(results)&&results.length>0)paid=Math.min(requested,results.length);

        var alreadyCharged=Math.max(0,available-essenceAfterOriginal);
        var targetCharge=paid*FAMILIAR_SUMMON_COST_V322A;
        var surcharge=Math.max(0,targetCharge-alreadyCharged);
        if(surcharge>0){
          try{
            if(typeof update==='function')update(function(st){st.essence=Math.max(0,(Number(st.essence)||0)-surcharge);});
            else if(typeof S!=='undefined'&&S)S.essence=Math.max(0,(Number(S.essence)||0)-surcharge);
          }catch(_){ }
        }
        return results;
      };
      wrappedSummonEgg.__srV322A=true;
      wrappedSummonEgg.__srPrevious=previousSummonEgg;
      summonEgg=wrappedSummonEgg;
    }
  }catch(_){ }

  /* The Familiar screen was authored against the legacy lexical constant.
     Patch only the rendered price/disabled state while keeping its canonical
     layout and controls intact. */
  try{
    if(typeof scrFamiliers==='function'&&!scrFamiliers.__srV322A){
      var previousScrFamiliers=scrFamiliers;
      var wrappedScrFamiliers=function(){
        var html=String(previousScrFamiliers.apply(this,arguments));
        html=html.replace(/Invoquer · 25/g,'Invoquer · 50').replace(/x10 · 250/g,'x10 · 500');
        var essence=0;try{essence=Math.max(0,Number(S&&S.essence)||0);}catch(_){ }
        html=html.replace(/<button([^>]*data-act="summonEgg"[^>]*)>/g,function(full,attrs){
          var m=attrs.match(/data-arg="(\d+)"/),qty=m?Math.max(1,Number(m[1])||1):1;
          if(essence>=FAMILIAR_SUMMON_COST_V322A*qty||/\sdisabled(?:\s|=|$)/.test(attrs))return full;
          return '<button'+attrs+' disabled>';
        });
        return html;
      };
      wrappedScrFamiliers.__srV322A=true;
      wrappedScrFamiliers.__srPrevious=previousScrFamiliers;
      scrFamiliers=wrappedScrFamiliers;
      try{if(typeof SCREENS!=='undefined'&&SCREENS&&typeof SCREENS.familiers==='function')SCREENS.familiers=wrappedScrFamiliers;}catch(_){ }
    }
  }catch(_){ }

  try{
    if(typeof RESOURCE_INFO!=='undefined'&&RESOURCE_INFO&&RESOURCE_INFO.essence){
      RESOURCE_INFO.essence.desc='Sert à invoquer des œufs de Familier. Une invocation coûte 50 Essence.'+
        ((typeof S!=='undefined'&&S&&S.economyDebt&&S.economyDebt.essence)?
          ' Rééquilibrage en cours : les prochaines Essences remboursent d’abord '+fmt(S.economyDebt.essence)+' Essences historiques.':'');
    }
  }catch(_){ }

  window.__srApplyRaidFamilierEssenceCompensationV335=compensateFamiliarRaidEssenceV335;
  window.__srFamiliarSummonCostV322A=FAMILIAR_SUMMON_COST_V322A;
  window.__srRaidSummonEconomyConfigV291={
    competence:{base:COMPETENCE_RAID_BASE,perLevel:COMPETENCE_RAID_PER_LEVEL},
    familier:{
      base:FAMILIAR_RAID_BASE_V335,
      perLevel:FAMILIAR_RAID_PER_LEVEL_V335,
      previousBase:FAMILIAR_RAID_PREVIOUS_BASE,
      previousPerLevel:FAMILIAR_RAID_PREVIOUS_PER_LEVEL,
      compensationMarker:FAMILIAR_COMP_MARKER,
      paidSummonCost:FAMILIAR_SUMMON_COST_V322A
    },
    expectedPaidSummonsPerBaseRaidWin:{level1:7,level50:11.9}
  };

  compensateCurrentFamiliarRaidEssenceV335();
})();