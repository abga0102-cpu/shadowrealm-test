/* SHADOWREACH V394 · Skill/Familiar summon economy authority
   - Raid Compétence remains 250 at lvl1, +10 per level.
   - Raid Familier starts at 300, gains +3 per level through lvl10,
     then +1 per level from lvl11 through lvl50.
   V322A changes only the PAID Familiar invocation price from 25 to 50 Essence.
   Tree Double Œuf stays a free extra result and never pays a second 50 Essence.
   Skill costs, raid keys, reward curves and all other raids remain unchanged. */
(function(){
  'use strict';
  if(window.__srRaidSummonEconomyV291)return;
  window.__srRaidSummonEconomyV291=true;

  var FAMILIAR_SUMMON_COST_V322A=50;

  function competenceReward(level){
    level=Math.max(1,Math.floor(Number(level)||1));
    return 250+10*(level-1);
  }

  function familiarReward(level){
    level=Math.max(1,Math.floor(Number(level)||1));
    if(level<=10) return 300+3*(level-1);
    return 327+(level-10);
  }

  try{
    if(typeof raidReward==='function'&&!raidReward.__srV291){
      var previousRaidReward=raidReward;
      var wrappedReward=function(type,level){
        if(type==='competence')return competenceReward(level);
        if(type==='familier')return familiarReward(level);
        return previousRaidReward.apply(this,arguments);
      };
      wrappedReward.__srV291=true;
      wrappedReward.__srPrevious=previousRaidReward;
      raidReward=wrappedReward;
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

  window.__srFamiliarSummonCostV322A=FAMILIAR_SUMMON_COST_V322A;
  window.__srRaidSummonEconomyConfigV291={
    competence:{base:250,perLevel:10},
    familier:{base:300,perLevelTo10:3,perLevelAfter10:1,level10:327,level50:367,paidSummonCost:FAMILIAR_SUMMON_COST_V322A},
    expectedPaidSummonsPerBaseRaidWin:{level1:6,level50:7.34}
  };
})();
