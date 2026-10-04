/* SHADOWREACH V396 · Final Raid authority / V496 Raid balance
   Owns final Raid rewards and the requested milestone power modifier. */
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

  /* V496: breathing room inside each 5-level block, followed by a deliberate
     milestone jump. Levels 5/10/15 add 15% each; level 20 and every fifth
     level afterwards add 10%. Multipliers compound and apply equally to Raid
     HP and damage, preserving enemy identity and all existing Raid curves. */
  function raidMilestonePower(level){
    var lv=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    var pre20=Math.min(3,Math.floor(lv/5));
    var from20=lv>=20?Math.floor((lv-20)/5)+1:0;
    return Math.pow(1.15,pre20)*Math.pow(1.10,from20);
  }
  if(typeof makeEnemy==='function'&&!makeEnemy.__srRaidMilestonesV496){
    var makeEnemyBeforeV496=makeEnemy;
    var makeEnemyV496=function(mode,opts){
      var enemy=makeEnemyBeforeV496.apply(this,arguments);
      if(mode==='raid'&&enemy&&opts){
        var mul=raidMilestonePower(opts.raidLevel);
        enemy.hp=enemy.maxHP=Math.max(1,Math.floor(enemy.maxHP*mul));
        enemy.dmg=Math.max(1,Math.floor(enemy.dmg*mul));
        enemy.__srRaidMilestoneMulV496=mul;
      }
      return enemy;
    };
    makeEnemyV496.__srRaidMilestonesV496=true;
    makeEnemyV496.__srPrevious=makeEnemyBeforeV496;
    makeEnemy=makeEnemyV496;
  }

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
    evolution:{level1:150,perLevelTo14:10,level14:280,perLevelFrom15:5,level70:560},
    milestonePower:{level5:1.15,level10:Math.pow(1.15,2),level15:Math.pow(1.15,3),level20:Math.pow(1.15,3)*1.10,multiplier:raidMilestonePower},
    reward:raidReward
  };
})();