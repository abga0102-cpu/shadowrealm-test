/* SHADOWREACH V396 · Final Raid reward authority
   Loaded after all legacy raid economy modules so no older wrapper can restore
   superseded reward curves. This file owns reward output only; raid difficulty,
   keys, summon prices and the permanent 1-1 -> 7-10 ladder stay owned elsewhere. */
(function(){
  'use strict';
  if(window.__srRaidRewardAuthorityV396)return;
  window.__srRaidRewardAuthorityV396=true;

  var GOLD_GROWTH=1.057;
  var MINERAI_EARLY=[600,630,660,690,720,750,780,810,830,850];

  function goldReward(level){
    var lv=Math.max(1,Math.floor(Number(level)||1));
    if(lv<=10) return Math.round(5000+(10000-5000)*((lv-1)/9));
    if(lv<=15) return 10000+(lv-10)*1000;
    if(lv<=20) return 15000+(lv-15)*1000;
    return Math.floor(20000*Math.pow(GOLD_GROWTH,lv-20));
  }

  function mineraiReward(level){
    var lv=Math.max(1,Math.floor(Number(level)||1));
    if(lv<=10)return MINERAI_EARLY[lv-1];
    return 850+(lv-10)*10;
  }

  function competenceReward(level){
    var lv=Math.max(1,Math.floor(Number(level)||1));
    return 250+10*(lv-1);
  }

  function familiarReward(level){
    var lv=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    if(lv<=11)return 200+5*(lv-1);
    return 250+2*(lv-11);
  }

  function evolutionReward(level){
    var lv=Math.max(1,Math.floor(Number(level)||1));
    return 150+3*(lv-1);
  }

  raidReward=function(type,level){
    if(type==='or')return goldReward(level);
    if(type==='minerai')return mineraiReward(level);
    if(type==='competence')return competenceReward(level);
    if(type==='familier')return familiarReward(level);
    if(type==='evolution')return evolutionReward(level);
    return 0;
  };
  raidReward.__srFinalAuthorityV396=true;

  window.__srRaidRewardConfigV396={
    or:{level1:5000,level10:10000,level15:15000,level20:20000,growthAfter20:GOLD_GROWTH},
    minerai:{level1:600,level10:850,perLevelAfter10:10},
    competence:{level1:250,perLevel:10},
    familier:{level1:200,perLevelTo250:5,level11:250,perLevelAfter250:2,level70:368},
    evolution:{level1:150,perLevel:3},
    reward:raidReward
  };
})();