/* SHADOWREACH V289 · Campaign enemy balance authority
   V362: campaign HP and damage are reduced by 40% at their source.
   The special visible stage 1-2 Forge tutorial remains owned by V321 and may
   intentionally overwrite these values before the player's first Forge craft.

   Design rule:
   - The floor determines enemy power. Current player stats are never sampled.
   - The existing campaign curve, tiers, elites, bosses and progression remain intact.
   - Normal campaign combat uses 60% of the previous HP and damage values.
   - Visible stage 1-2 keeps its existing forced tutorial behavior before Forge.
   - Raid balance is unchanged.
*/
(function(){
  'use strict';
  if(window.__srEnemyDamageV289)return;
  window.__srEnemyDamageV289=true;
  window.__srCampaignReferenceBalanceV323=true;
  window.__srCampaignReferenceBalanceV324=true;
  window.__srCampaignReferenceBalanceV325=true;
  window.__srCampaignPowerSourceV362=true;

  var LEGACY_MAX=400;
  var CAMPAIGN_POWER_MUL=0.60;
  var TARGET_HITS_TO_KILL=3.6;
  var TARGET_HITS_TO_DEFEAT_REFERENCE=8;
  var INTRO_FLOOR_HP=65;
  var INTRO_FLOOR_DAMAGE=6;
  var RAID_HP_MUL=1.35;
  var RAID_DAMAGE_MUL=1.25;

  var REFERENCE_DAMAGE={
    1:30,3:80,5:150,10:350,15:800,20:2500,30:23000,40:180000,50:900000,
    60:2700000,70:6800000,80:13600000,100:36000000,
    120:82000000,150:250000000,200:1000000000,
    250:3600000000,300:12700000000,350:43000000000,400:145000000000
  };

  var REFERENCE_HP={
    1:100,3:180,5:400,10:1200,20:4000,30:15000,40:20000,50:500000,
    60:3000000,70:15000000,80:60000000,90:100000000,
    100:150000000,110:200000000,120:260000000,130:320000000,
    140:380000000,150:380000000,200:900000000,
    250:2100000000,300:4800000000,350:10500000000,400:23000000000
  };

  function maxFloor(){
    try{return Math.max(1,Number(window.__srCampaignMaxFloor)||800);}catch(_){return 800;}
  }
  function semanticLegacyFloor(f){
    var max=maxFloor();f=Math.max(1,Math.min(max,Number(f)||1));
    return 1+(f-1)*(LEGACY_MAX-1)/(max-1);
  }
  function logInterp(table,f){
    var keys=Object.keys(table).map(Number).sort(function(a,b){return a-b;});
    if(f<=keys[0])return table[keys[0]];
    for(var i=1;i<keys.length;i++){
      if(f<=keys[i]){
        var a=keys[i-1],b=keys[i],t=(f-a)/(b-a);
        return Math.max(1,Math.round(Math.exp(Math.log(table[a])+(Math.log(table[b])-Math.log(table[a]))*t)));
      }
    }
    return table[keys[keys.length-1]];
  }

  function expectedDamage(f){return logInterp(REFERENCE_DAMAGE,semanticLegacyFloor(f));}
  function expectedHP(f){return logInterp(REFERENCE_HP,semanticLegacyFloor(f));}
  function isIntroFloor(f){return Math.max(1,Math.round(Number(f)||1))===1;}
  function previousCampaignEnemyHP(f){
    if(isIntroFloor(f))return INTRO_FLOOR_HP;
    return Math.max(1,Math.round(expectedDamage(f)*TARGET_HITS_TO_KILL));
  }
  function previousCampaignEnemyDamage(f){
    if(isIntroFloor(f))return INTRO_FLOOR_DAMAGE;
    return Math.max(1,Math.round(expectedHP(f)/TARGET_HITS_TO_DEFEAT_REFERENCE));
  }
  function campaignEnemyHP(f){return Math.max(1,Math.round(previousCampaignEnemyHP(f)*CAMPAIGN_POWER_MUL));}
  function campaignEnemyDamage(f){return Math.max(1,Math.round(previousCampaignEnemyDamage(f)*CAMPAIGN_POWER_MUL));}

  /* Boss HP has a separate final authority (V288). Scale its source by the same
     factor so boss ratios and final post-spawn targets stay consistent instead
     of cancelling the normal-enemy reduction. */
  var previousBossHP=typeof window.__srV285BossHP==='function'?window.__srV285BossHP:null;
  function campaignBossHP(f){
    if(!previousBossHP)return null;
    var v=Number(previousBossHP(f));
    return isFinite(v)&&v>0?Math.max(1,Math.round(v*CAMPAIGN_POWER_MUL)):v;
  }

  window.__srV285EnemyHP=campaignEnemyHP;
  window.__srV289EnemyDamage=campaignEnemyDamage;
  if(previousBossHP)window.__srV285BossHP=campaignBossHP;
  window.__srV323ExpectedPlayerDamage=expectedDamage;
  window.__srV323ExpectedPlayerHP=expectedHP;
  window.__srV324ExpectedPlayerDamage=expectedDamage;
  window.__srV324ExpectedPlayerHP=expectedHP;
  window.__srV325ExpectedPlayerDamage=expectedDamage;
  window.__srV325ExpectedPlayerHP=expectedHP;
  try{if(typeof enemyHP==='function')enemyHP=campaignEnemyHP;}catch(_){ }
  try{if(typeof enemyDamage==='function')enemyDamage=campaignEnemyDamage;}catch(_){ }

  /* V324 raid-only difficulty increase. Raid formulas remain unchanged. */
  try{
    if(typeof makeEnemy==='function'){
      var makeEnemyBeforeRaidV324=makeEnemy;
      makeEnemy=function(mode,opts){
        var enemy=makeEnemyBeforeRaidV324(mode,opts);
        if(mode==='raid' && enemy){
          enemy.hp=enemy.maxHP=Math.max(1,Math.floor(enemy.maxHP*RAID_HP_MUL));
          enemy.dmg=Math.max(1,Math.floor(enemy.dmg*RAID_DAMAGE_MUL));
        }
        return enemy;
      };
      window.__srRaidPowerV324=true;
    }
  }catch(_){ }

  window.__srEnemyDamageConfigV289={
    version:325,maxFloor:800,legacyMaxFloor:400,semanticLegacyFloor:semanticLegacyFloor,
    referenceDamage:REFERENCE_DAMAGE,referenceHP:REFERENCE_HP,
    targetHitsToKill:TARGET_HITS_TO_KILL,targetHitsToDefeatReference:TARGET_HITS_TO_DEFEAT_REFERENCE,
    expectedPlayerDamage:expectedDamage,expectedPlayerHP:expectedHP,
    enemyHP:campaignEnemyHP,enemyDamage:campaignEnemyDamage,
    campaignPowerMul:CAMPAIGN_POWER_MUL,sourceReductionV362:true,
    forgeTutorialException:{visibleStage:'1-2',internalFloor:2,owner:'V321',beforeFirstForge:true},
    scaling:'floor-only-no-player-rubber-band',
    earlyCampaign:'1-1-onboarding-then-gear-pressure',
    introFloor:{floor:1,hp:Math.max(1,Math.round(INTRO_FLOOR_HP*CAMPAIGN_POWER_MUL)),damage:Math.max(1,Math.round(INTRO_FLOOR_DAMAGE*CAMPAIGN_POWER_MUL))},
    raidPowerV324:{hpMul:RAID_HP_MUL,damageMul:RAID_DAMAGE_MUL,campaignUnchanged:true},
    expectedGates:{
      weak:'69-89',normal:'99-119',max0:'139-159',ascended:'199-299+',
      nightmare:'301-400',infernal:'401-500',abyssal:'501-600',immortal:'601-700',divine:'701-800'
    }
  };
})();
