/* SHADOWREACH V362 / V473 · campaign smoothing after source-level -40% power
   - Keeps the existing Facile smoothing from floor 61 to 100.
   - V473 bridges Difficile 1-1 -> Difficile 2-10 (floors 101..130) instead of
     removing the Facile multipliers in one frame at floor 101.
   - The post-Boss handoff gives the opening of Difficile a short breathing
     window, then returns progressively to the normal campaign curve by floor 130.
   - Difficile 1-5 is calibrated near +55..60% over the Facile 5-20 Boss,
     instead of the previous multi-fold jump.
   - The global -40% campaign reduction remains owned by enemy-damage-authority-v289.js.
   - Ranks, rewards, progression and Raid/Mega balance remain unchanged. */
(function(){
  'use strict';
  if(window.__srCampaignTierBalanceV362)return;
  window.__srCampaignTierBalanceV362=true;

  try{if(window.__srCampaignRankObserverV353&&window.__srCampaignRankObserverV353.disconnect)window.__srCampaignRankObserverV353.disconnect();}catch(_){}
  try{if(window.__srCampaignTierObserverV353&&window.__srCampaignTierObserverV353.disconnect)window.__srCampaignTierObserverV353.disconnect();}catch(_){}
  try{if(window.__srCampaignTierLabelObserverV352&&window.__srCampaignTierLabelObserverV352.disconnect)window.__srCampaignTierLabelObserverV352.disconnect();}catch(_){}

  var SMOOTH_START=61;
  var SMOOTH_END=100;
  var DIFFICILE_BRIDGE_START=101;
  var DIFFICILE_BRIDGE_END=130;
  var EASY_NORMAL_HP_END=0.52;
  var EASY_BOSS_HP_END=0.45;
  var EASY_DAMAGE_END=0.60;
  var DIFFICILE_BOSS_HP_START=0.42;
  var DIFFICILE_DAMAGE_START=0.50;

  function clamp01(v){return Math.max(0,Math.min(1,Number(v)||0));}
  function lerp(a,b,t){return a+(b-a)*clamp01(t);}
  function smoothT(floor){return clamp01((Number(floor)-SMOOTH_START)/(SMOOTH_END-SMOOTH_START));}
  function bridgeT(floor){return clamp01((Number(floor)-DIFFICILE_BRIDGE_START)/(DIFFICILE_BRIDGE_END-DIFFICILE_BRIDGE_START));}
  function smoothHpMul(floor,isBoss){
    floor=Number(floor)||0;
    if(floor<=SMOOTH_END){
      var t=smoothT(floor);
      return isBoss?lerp(1,EASY_BOSS_HP_END,t):lerp(1,EASY_NORMAL_HP_END,t);
    }
    if(floor<=DIFFICILE_BRIDGE_END){
      var b=bridgeT(floor),start=isBoss?DIFFICILE_BOSS_HP_START:EASY_NORMAL_HP_END;
      return lerp(start,1,b);
    }
    return 1;
  }
  function smoothDamageMul(floor){
    floor=Number(floor)||0;
    if(floor<=SMOOTH_END)return lerp(1,EASY_DAMAGE_END,smoothT(floor));
    if(floor<=DIFFICILE_BRIDGE_END)return lerp(DIFFICILE_DAMAGE_START,1,bridgeT(floor));
    return 1;
  }

  try{
    if(typeof makeEnemy==='function'&&!makeEnemy.__srCampaignTierBalanceV362){
      var previousMakeEnemy=makeEnemy;
      makeEnemy=function(mode,opts){
        var enemy=previousMakeEnemy(mode,opts);
        if(mode!=='campaign'||!opts||!enemy)return enemy;

        var floor=Number(opts.floor)||0;
        if(floor<SMOOTH_START||floor>DIFFICILE_BRIDGE_END)return enemy;

        /* V334 already tapers 76..100. Undo it first so only this established
           smooth curve applies on top of the source-level campaign balance. */
        var old=enemy.__srLateEasyBalanceV334;
        if(old){
          var oldHp=Math.max(0.000001,Number(old.hpMul)||1);
          var oldDmg=Math.max(0.000001,Number(old.dmgMul)||1);
          enemy.maxHP=Math.max(1,Math.round(Number(enemy.maxHP||enemy.hp||1)/oldHp));
          enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.round(Number(enemy.hp||enemy.maxHP||1)/oldHp)));
          enemy.dmg=Math.max(1,Math.round(Number(enemy.dmg||1)/oldDmg));
        }

        var hpMul=smoothHpMul(floor,!!opts.boss);
        var dmgMul=smoothDamageMul(floor);
        enemy.maxHP=Math.max(1,Math.floor(Number(enemy.maxHP||enemy.hp||1)*hpMul));
        enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.floor(Number(enemy.hp||enemy.maxHP||1)*hpMul)));
        enemy.dmg=Math.max(1,Math.floor(Number(enemy.dmg||1)*dmgMul));
        enemy.__srCampaignBalanceV362={
          hpMul:hpMul,
          dmgMul:dmgMul,
          sourcePowerMul:(window.__srEnemyDamageConfigV289&&Number(window.__srEnemyDamageConfigV289.campaignPowerMul))||0.60,
          smoothApplied:true,
          difficileBridgeV473:floor>=DIFFICILE_BRIDGE_START
        };
        return enemy;
      };
      makeEnemy.__srCampaignTierBalanceV362=true;
    }
  }catch(_){}

  var RANKS=[
    {min:1,max:25,label:'Looser'},
    {min:26,max:49,label:'Débutant'},
    {min:50,max:99,label:'Aventurier'},
    {min:100,max:249,label:'Prodige'},
    {min:250,max:499,label:'Héros'},
    {min:500,max:699,label:'Légende'},
    {min:700,max:Infinity,label:'Divin'}
  ];
  function rankForFloor(floor){
    floor=Math.max(1,Math.floor(Number(floor)||1));
    for(var i=0;i<RANKS.length;i++)if(floor>=RANKS[i].min&&floor<=RANKS[i].max)return RANKS[i].label;
    return 'Divin';
  }
  window.__srCampaignRankForFloor=rankForFloor;
  window.__srCampaignFloorLabel=function(floor){floor=Math.max(1,Math.floor(Number(floor)||1));return rankForFloor(floor)+' · Étage '+floor;};

  window.__srCampaignDifficultyBridgeV473={
    version:473,
    fromFloor:DIFFICILE_BRIDGE_START,
    toFloor:DIFFICILE_BRIDGE_END,
    visibleFrom:'Difficile 1-1',
    visibleTo:'Difficile 2-10',
    startNormalHpMul:EASY_NORMAL_HP_END,
    startBossHpMul:DIFFICILE_BOSS_HP_START,
    facileBossHpMulEnd:EASY_BOSS_HP_END,
    startDamageMul:DIFFICILE_DAMAGE_START,
    facileDamageMulEnd:EASY_DAMAGE_END,
    hpMultiplier:smoothHpMul,
    damageMultiplier:smoothDamageMul
  };
  window.__srCampaignTierBalanceConfigV362={
    smoothStartFloor:SMOOTH_START,
    smoothEndFloor:SMOOTH_END,
    difficileBridgeEndFloor:DIFFICILE_BRIDGE_END,
    normalHpMulEnd:EASY_NORMAL_HP_END,
    bossHpMulEnd:EASY_BOSS_HP_END,
    smoothDamageMulEnd:EASY_DAMAGE_END,
    globalPowerMulHere:1,
    sourcePowerAuthority:'enemy-damage-authority-v289.js V362',
    ranks:RANKS,
    globalDomObserver:false,
    accomplishmentsRecovery:false
  };
})();
