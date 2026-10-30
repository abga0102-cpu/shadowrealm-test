/* SHADOWREACH V396 · Final Raid reward authority / V499 Raid Minerai balance
   Owns final Raid rewards. Raid power staircase is owned canonically by game-1.js. */
(function(){
  'use strict';
  if(window.__srRaidRewardAuthorityV396)return;
  window.__srRaidRewardAuthorityV396=true;

  /* Gold uses a bounded linear ramp after level 20 to reach 50,000 at 500. */
  function goldReward(level){
    var lv=Math.max(1,Math.floor(Number(level)||1));
    if(lv<=10)return Math.round(5000+5000*((lv-1)/9));
    if(lv<=15)return Math.round(10000+10000*((lv-10)/5));
    if(lv<=20)return Math.round(20000+10000*((lv-15)/5));
    return Math.round(30000+20000*(Math.min(500,lv)-20)/480);
  }
  function mineraiReward(level){
    var lv=Math.max(1,Math.min(500,Math.floor(Number(level)||1)));
    if(lv<=21)return 1000+50*(lv-1);
    if(lv<=41)return 2000+25*(lv-21);
    if(lv<=61)return 2500+15*(lv-41);
    if(lv<=70)return 2800+5*(lv-61);
    return Math.round(2845+(10000-2845)*(lv-70)/430);
  }
  function competenceReward(level){var lv=Math.max(1,Math.min(500,Math.floor(Number(level)||1)));if(lv<=70)return 300+10*(lv-1);return Math.round(990+(4500-990)*(lv-70)/430); }
  function familiarReward(level){
    var lv=Math.max(1,Math.min(500,Math.floor(Number(level)||1)));
    if(lv<=11)return 225+5*(lv-1);
    return 275+2*(lv-11);
  }
  function evolutionReward(level){
    var lv=Math.max(1,Math.min(500,Math.floor(Number(level)||1)));
    if(lv<=14)return 150+10*(lv-1);
    if(lv<=70)return 280+5*(lv-14);
    return Math.round(560+(1500-560)*(lv-70)/430);
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
    version:499,
    or:{level1:5000,level10:10000,level15:20000,level20:30000,level500:50000},
    minerai:{level1:1000,perLevelTo2000:50,level21:2000,perLevelTo2500:25,level41:2500,perLevelTo2800:15,level61:2800,perLevelAfter2800:5,level70:2845,level500:10000},
    competence:{level1:300,perLevelTo70:10,level70:990,level500:4500},
    familier:{level1:225,perLevelTo11:5,level11:275,perLevelAfter11:2,level70:393,level500:1253},
    evolution:{curveVersion:486,level1:150,perLevelTo14:10,level14:280,perLevelFrom15:5,level15:285,level70:560,level500:1500},
    powerOwner:'game-1.js:raidPowerStepMultiplierV496',
    reward:raidReward
  };
})();