/* SHADOWREACH V396 · Final Raid reward authority / V496 Raid balance
   Owns final Raid rewards. Raid power staircase is owned canonically by game-1.js. */
(function(){
  'use strict';
  if(window.__srRaidRewardAuthorityV396)return;
  window.__srRaidRewardAuthorityV396=true;

  var GOLD_GROWTH=1.05;
  function goldReward(level){
    var lv=Math.max(1,Math.floor(Number(level)||1));
    if(lv<=10)return Math.round(5000+5000*((lv-1)/9));
    if(lv<=15)return Math.round(10000+10000*((lv-10)/5));
    if(lv<=20)return Math.round(20000+10000*((lv-15)/5));
    return Math.floor(30000*Math.pow(GOLD_GROWTH,lv-20));
  }
  function mineraiReward(level){
    var lv=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    if(lv<=11)return 500+50*(lv-1);
    if(lv<=31)return 1000+25*(lv-11);
    return 1500+10*(lv-31);
  }
  function competenceReward(level){var lv=Math.max(1,Math.floor(Number(level)||1));return 300+10*(lv-1);}
  function familiarReward(level){
    var lv=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    if(lv<=11)return 225+5*(lv-1);
    return 275+2*(lv-11);
  }
  function evolutionReward(level){
    var lv=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    if(lv<=14)return 150+10*(lv-1);
    return 280+5*(lv-14);
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

  /* V496 Raid power is not wrapped here: game-1.js is the single power owner. */

  raidCampaignReady=function(){return true;};
  raidCampaignReady.__srIndependentV446=true;
  if(window.__srRaidCampaignLinkedV444){window.__srRaidCampaignLinkedV444.campaignReady=raidCampaignReady;window.__srRaidCampaignLinkedV444.campaignGate=false;}
  window.__srRaidAccessV446={version:446,campaignGate:false,campaignReady:raidCampaignReady};

  window.__srRaidRewardConfigV396={
    version:496,
    or:{level1:5000,level10:10000,level15:20000,level20:30000,growthAfter20:GOLD_GROWTH},
    minerai:{level1:500,perLevelTo1000:50,level11:1000,perLevelTo1500:25,level31:1500,perLevelAfter1500:10,level70:1890},
    competence:{level1:300,perLevel:10},
    familier:{level1:225,perLevelTo11:5,level11:275,perLevelAfter11:2,level70:393},
    evolution:{curveVersion:486,level1:150,perLevelTo14:10,level14:280,perLevelFrom15:5,level15:285,level70:560},
    powerOwner:'game-1.js:raidPowerStepMultiplierV496',
    reward:raidReward
  };
})();