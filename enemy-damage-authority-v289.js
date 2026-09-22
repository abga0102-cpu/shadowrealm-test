/* SHADOWREACH V289 · Enemy balance authority
   V362 reduced Campaign HP and damage to 60% of their earlier source values.
   V380 adds the requested global nerf on top of the live balance:
   - every enemy keeps 90% of its current HP (-10%);
   - every enemy keeps 60% of its current base damage (-40%);
   - normal enemies, Elites, Bosses and Raid enemies all inherit the same nerf;
   - Mega-Bosses remain x10 versions of the already-reduced Campaign Boss;
   - the special visible stage 1-2 Forge tutorial remains owned by V321 and may
     intentionally overwrite these values before the player's first Forge craft.

   Design rule:
   - The floor determines enemy power. Current player stats are never sampled.
   - Existing curves, identities, tiers and relative Boss/Mega-Boss ratios stay intact.
   V425 smooths Campaign damage from visible stage Difficile 3-10 (floor 150):
   - target is another -50% on base Campaign damage from that point onward;
   - the transition is clamped to at least +0.5% per internal floor, so the new
     balance never makes a later floor's base damage lower than the floor before it;
   - HP, Raids, rewards and player stats are untouched.
*/
(function(){
  'use strict';
  if(window.__srEnemyDamageV289)return;
  window.__srEnemyDamageV289=true;
  window.__srCampaignReferenceBalanceV323=true;
  window.__srCampaignReferenceBalanceV324=true;
  window.__srCampaignReferenceBalanceV325=true;
  window.__srCampaignPowerSourceV362=true;
  window.__srGlobalEnemyNerfV380=true;
  window.__srAdditionalEnemyDamageNerfV381=true;

  var LEGACY_MAX=400;
  var V362_CAMPAIGN_POWER_MUL=0.60;
  var GLOBAL_HP_MUL_V380=0.90;
  var GLOBAL_DAMAGE_MUL_V380=0.60;
  var ADDITIONAL_DAMAGE_MUL_V381=0.50;
  var GLOBAL_DAMAGE_MUL_V381=GLOBAL_DAMAGE_MUL_V380*ADDITIONAL_DAMAGE_MUL_V381;
  var CAMPAIGN_HP_MUL=V362_CAMPAIGN_POWER_MUL*GLOBAL_HP_MUL_V380;
  var CAMPAIGN_DAMAGE_MUL_V380=V362_CAMPAIGN_POWER_MUL*GLOBAL_DAMAGE_MUL_V380;
  var CAMPAIGN_DAMAGE_MUL=V362_CAMPAIGN_POWER_MUL*GLOBAL_DAMAGE_MUL_V381;
  var TARGET_HITS_TO_KILL=3.6;
  var TARGET_HITS_TO_DEFEAT_REFERENCE=8;
  var INTRO_FLOOR_HP=65;
  var INTRO_FLOOR_DAMAGE=6;
  var RAID_BASE_HP_MUL_V324=1.35;
  var RAID_BASE_DAMAGE_MUL_V324=1.25;
  var RAID_HP_MUL=RAID_BASE_HP_MUL_V324*GLOBAL_HP_MUL_V380;
  var RAID_DAMAGE_MUL_V380=RAID_BASE_DAMAGE_MUL_V324*GLOBAL_DAMAGE_MUL_V380;
  var RAID_DAMAGE_MUL=RAID_BASE_DAMAGE_MUL_V324*GLOBAL_DAMAGE_MUL_V381;
  var DIFFICILE_3_10_FLOOR_V425=150;
  var DIFFICILE_3_10_DAMAGE_MUL_V425=0.50;
  var DIFFICILE_3_10_MIN_STAGE_GROWTH_V425=1.005;
  var CAMPAIGN_DAMAGE_CACHE_V425={};

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
  function campaignEnemyHP(f){return Math.max(1,Math.round(previousCampaignEnemyHP(f)*CAMPAIGN_HP_MUL));}
  function campaignEnemyDamageBeforeV425(f){
    return Math.max(1,Math.round(previousCampaignEnemyDamage(f)*CAMPAIGN_DAMAGE_MUL));
  }
  function campaignEnemyDamage(f){
    f=Math.max(1,Math.min(maxFloor(),Math.round(Number(f)||1)));
    var raw=campaignEnemyDamageBeforeV425(f);
    if(f<DIFFICILE_3_10_FLOOR_V425)return raw;
    if(CAMPAIGN_DAMAGE_CACHE_V425[f])return CAMPAIGN_DAMAGE_CACHE_V425[f];

    /* Start from the live damage immediately before Difficile 3-10, then walk
       forward with a tiny guaranteed rise. This allows a strong late-game nerf
       without creating a backwards difficulty step at the exact cutover. */
    var prev=campaignEnemyDamageBeforeV425(DIFFICILE_3_10_FLOOR_V425-1);
    for(var floor=DIFFICILE_3_10_FLOOR_V425;floor<=f;floor++){
      if(CAMPAIGN_DAMAGE_CACHE_V425[floor]){
        prev=CAMPAIGN_DAMAGE_CACHE_V425[floor];
        continue;
      }
      var target=Math.max(1,Math.round(campaignEnemyDamageBeforeV425(floor)*DIFFICILE_3_10_DAMAGE_MUL_V425));
      prev=Math.max(target,Math.ceil(prev*DIFFICILE_3_10_MIN_STAGE_GROWTH_V425));
      CAMPAIGN_DAMAGE_CACHE_V425[floor]=prev;
    }
    return CAMPAIGN_DAMAGE_CACHE_V425[f];
  }

  /* Boss HP has a separate final authority (V288). Scale its source by the same
     factor so boss ratios and final post-spawn targets stay consistent instead
     of cancelling the normal-enemy reduction. */
  var previousBossHP=typeof window.__srV285BossHP==='function'?window.__srV285BossHP:null;
  function campaignBossHP(f){
    if(!previousBossHP)return null;
    var v=Number(previousBossHP(f));
    return isFinite(v)&&v>0?Math.max(1,Math.round(v*CAMPAIGN_HP_MUL)):v;
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

  /* Keep the V324 Raid relationship, then apply the same V380 global nerf.
     This covers normal Raid enemies and named Raid bosses without flattening
     their existing relative difficulty. */
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
    version:425,maxFloor:800,legacyMaxFloor:400,semanticLegacyFloor:semanticLegacyFloor,
    referenceDamage:REFERENCE_DAMAGE,referenceHP:REFERENCE_HP,
    targetHitsToKill:TARGET_HITS_TO_KILL,targetHitsToDefeatReference:TARGET_HITS_TO_DEFEAT_REFERENCE,
    expectedPlayerDamage:expectedDamage,expectedPlayerHP:expectedHP,
    enemyHP:campaignEnemyHP,enemyDamage:campaignEnemyDamage,
    campaignPowerMul:V362_CAMPAIGN_POWER_MUL,sourceReductionV362:true,
    campaignHpMulV380:CAMPAIGN_HP_MUL,campaignDamageMulV380:CAMPAIGN_DAMAGE_MUL_V380,
    campaignDamageMulV381:CAMPAIGN_DAMAGE_MUL,
    globalEnemyNerfV380:{
      hpMul:GLOBAL_HP_MUL_V380,damageMul:GLOBAL_DAMAGE_MUL_V380,
      appliesTo:['normal','elite','boss','raid','mega-boss'],
      megaBossRule:'reduced-campaign-boss-x10'
    },
    additionalDamageNerfV381:{
      currentDamageMul:ADDITIONAL_DAMAGE_MUL_V381,
      effectiveVsV379:GLOBAL_DAMAGE_MUL_V381,
      totalReductionVsV379Pct:70,
      appliesTo:['normal','elite','boss','raid','mega-boss']
    },
    difficile310DamageV425:{
      visibleStage:'Difficile 3-10',
      startFloor:DIFFICILE_3_10_FLOOR_V425,
      targetDamageMul:DIFFICILE_3_10_DAMAGE_MUL_V425,
      minStageGrowthPct:(DIFFICILE_3_10_MIN_STAGE_GROWTH_V425-1)*100,
      sourceDamage:campaignEnemyDamageBeforeV425,
      appliesTo:['campaign-normal','campaign-elite','campaign-boss','mega-boss'],
      raidsChanged:false,hpChanged:false
    },
    forgeTutorialException:{visibleStage:'1-2',internalFloor:2,owner:'V321',beforeFirstForge:true},
    scaling:'floor-only-no-player-rubber-band',
    earlyCampaign:'1-1-onboarding-then-gear-pressure',
    introFloor:{floor:1,hp:Math.max(1,Math.round(INTRO_FLOOR_HP*CAMPAIGN_HP_MUL)),damage:Math.max(1,Math.round(INTRO_FLOOR_DAMAGE*CAMPAIGN_DAMAGE_MUL))},
    raidPowerV324:{
      hpMul:RAID_HP_MUL,damageMul:RAID_DAMAGE_MUL_V380,
      effectiveDamageMulV381:RAID_DAMAGE_MUL,
      baseHpMul:RAID_BASE_HP_MUL_V324,baseDamageMul:RAID_BASE_DAMAGE_MUL_V324,
      globalNerfAppliedV380:true,additionalDamageNerfAppliedV381:true
    },
    expectedGates:{
      weak:'69-89',normal:'99-119',max0:'139-159',ascended:'199-299+',
      nightmare:'301-400',infernal:'401-500',abyssal:'501-600',immortal:'601-700',divine:'701-800'
    }
  };
})();
