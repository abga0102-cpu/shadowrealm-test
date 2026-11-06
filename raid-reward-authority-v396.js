/* SHADOWREACH V396 · Final Raid reward authority / V511 Raid rewards through level 500
   Owns final Raid rewards. Raid power staircase is owned canonically by game-1.js. */
(function(){
  'use strict';
  if(window.__srRaidRewardAuthorityV396)return;
  window.__srRaidRewardAuthorityV396=true;

  var LEGACY_MAX_LEVEL=70;
  var MAX_LEVEL=500;
  function rewardLevel(level){
    return Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(level)||1)));
  }
  function extendReward(level,legacyReward,target){
    return Math.round(legacyReward+(target-legacyReward)*(level-LEGACY_MAX_LEVEL)/(MAX_LEVEL-LEGACY_MAX_LEVEL));
  }
  /* Owner-approved linear base Gold: level 1 = 50, level 500 = 50,000.
     Rounded to the nearest whole Gold. Historical credits and save data are untouched. */
  function goldReward(level){
    var lv=rewardLevel(level);
    return Math.round(50+49950*(lv-1)/(MAX_LEVEL-1));
  }
  function mineraiReward(level){
    var lv=rewardLevel(level);
    if(lv<=21)return 1000+50*(lv-1);
    if(lv<=41)return 2000+25*(lv-21);
    if(lv<=61)return 2500+15*(lv-41);
    if(lv<=LEGACY_MAX_LEVEL)return 2800+5*(lv-61);
    return extendReward(lv,2845,10000);
  }
  function competenceReward(level){
    var lv=rewardLevel(level);
    if(lv<=LEGACY_MAX_LEVEL)return 300+10*(lv-1);
    return extendReward(lv,990,4500);
  }
  function familiarReward(level){
    var lv=rewardLevel(level);
    if(lv<=11)return 225+5*(lv-1);
    return 275+2*(lv-11);
  }
  function evolutionReward(level){
    var lv=rewardLevel(level);
    if(lv<=14)return 150+10*(lv-1);
    if(lv<=LEGACY_MAX_LEVEL)return 280+5*(lv-14);
    return extendReward(lv,560,1500);
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
    version:511,legacyMaxLevel:LEGACY_MAX_LEVEL,maxLevel:MAX_LEVEL,
    or:{level1:50,level500:50000,curve:'linear',rounding:'nearest'},
    minerai:{level1:1000,perLevelTo2000:50,level21:2000,perLevelTo2500:25,level41:2500,perLevelTo2800:15,level61:2800,perLevelAfter2800:5,level70:2845,level500:10000},
    competence:{level1:300,perLevel:10,perLevelTo70:10,level70:990,level500:4500},
    familier:{level1:225,perLevelTo11:5,level11:275,perLevelAfter11:2,level70:393,level500:1253},
    evolution:{curveVersion:486,level1:150,perLevelTo14:10,level14:280,perLevelFrom15:5,level15:285,level70:560,level500:1500},
    powerOwner:'game-1.js:raidPowerStepMultiplierV496',
    reward:raidReward
  };
})();