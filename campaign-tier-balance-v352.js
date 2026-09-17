/* SHADOWREACH V362 · campaign smoothing after source-level -40% power
   - Keeps the existing smooth monster curve from floor 61 to 100.
   - The global -40% campaign reduction now lives in enemy-damage-authority-v289.js.
   - Does not apply a second 0.60 multiplier here.
   - Keeps ranks, bosses, rewards, progression and Pass behavior unchanged. */
(function(){
  'use strict';
  if(window.__srCampaignTierBalanceV362)return;
  window.__srCampaignTierBalanceV362=true;

  try{if(window.__srCampaignRankObserverV353&&window.__srCampaignRankObserverV353.disconnect)window.__srCampaignRankObserverV353.disconnect();}catch(_){}
  try{if(window.__srCampaignTierObserverV353&&window.__srCampaignTierObserverV353.disconnect)window.__srCampaignTierObserverV353.disconnect();}catch(_){}
  try{if(window.__srCampaignTierLabelObserverV352&&window.__srCampaignTierLabelObserverV352.disconnect)window.__srCampaignTierLabelObserverV352.disconnect();}catch(_){}

  var SMOOTH_START=61;
  var SMOOTH_END=100;

  function clamp01(v){return Math.max(0,Math.min(1,Number(v)||0));}
  function lerp(a,b,t){return a+(b-a)*clamp01(t);}
  function smoothT(floor){return clamp01((Number(floor)-SMOOTH_START)/(SMOOTH_END-SMOOTH_START));}
  function smoothHpMul(floor,isBoss){
    var t=smoothT(floor);
    return isBoss?lerp(1,0.45,t):lerp(1,0.52,t);
  }
  function smoothDamageMul(floor){return lerp(1,0.60,smoothT(floor));}

  try{
    if(typeof makeEnemy==='function'&&!makeEnemy.__srCampaignTierBalanceV362){
      var previousMakeEnemy=makeEnemy;
      makeEnemy=function(mode,opts){
        var enemy=previousMakeEnemy(mode,opts);
        if(mode!=='campaign'||!opts||!enemy)return enemy;

        var floor=Number(opts.floor)||0;
        if(floor<SMOOTH_START||floor>SMOOTH_END)return enemy;

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
          smoothApplied:true
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

  window.__srCampaignTierBalanceConfigV362={
    smoothStartFloor:SMOOTH_START,
    smoothEndFloor:SMOOTH_END,
    normalHpMulEnd:0.52,
    bossHpMulEnd:0.45,
    smoothDamageMulEnd:0.60,
    globalPowerMulHere:1,
    sourcePowerAuthority:'enemy-damage-authority-v289.js V362',
    ranks:RANKS,
    globalDomObserver:false,
    accomplishmentsRecovery:false
  };
})();
