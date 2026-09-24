/* SHADOWREACH V396 · Final Raid reward authority
   Loaded after all legacy raid economy modules so no older wrapper can restore
   superseded reward curves. This file owns reward output only; raid difficulty,
   keys, summon prices and the permanent 1-1 -> 7-10 ladder stay owned elsewhere.

   V446: Raid access is independent from Campaign progression again. Campaign
   references remain strictly as difficulty calibration / informational labels;
   they must never lock a Raid level. */
(function(){
  'use strict';
  if(window.__srRaidRewardAuthorityV396)return;
  window.__srRaidRewardAuthorityV396=true;

  var GOLD_GROWTH=1.057;

  function goldReward(level){
    var lv=Math.max(1,Math.floor(Number(level)||1));
    if(lv<=10) return Math.round(5000+(10000-5000)*((lv-1)/9));
    if(lv<=15) return 10000+(lv-10)*1000;
    if(lv<=20) return 15000+(lv-15)*1000;
    return Math.floor(20000*Math.pow(GOLD_GROWTH,lv-20));
  }

  function mineraiReward(level){
    var lv=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    return 500+5*(lv-1);
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

  /* V446 · Campaign no longer gates Raid access.
     Keep raidReferenceCampaignFloor/Label untouched because V444 difficulty
     still uses them to scale the 70 Raid levels. Only the access predicate is
     neutralised. ACT.startRaid and scrRaid both read this global predicate, so
     gameplay and UI stay aligned. */
  raidCampaignReady=function(){return true;};
  raidCampaignReady.__srIndependentV446=true;
  if(window.__srRaidCampaignLinkedV444){
    window.__srRaidCampaignLinkedV444.campaignReady=raidCampaignReady;
    window.__srRaidCampaignLinkedV444.campaignGate=false;
  }
  window.__srRaidAccessV446={version:446,campaignGate:false,campaignReady:raidCampaignReady};

  window.__srRaidRewardConfigV396={
    or:{level1:5000,level10:10000,level15:15000,level20:20000,growthAfter20:GOLD_GROWTH},
    minerai:{level1:500,perLevel:5,level70:845},
    competence:{level1:250,perLevel:10},
    familier:{level1:200,perLevelTo250:5,level11:250,perLevelAfter250:2,level70:368},
    evolution:{level1:150,perLevel:3},
    reward:raidReward
  };
})();