/* SHADOWREACH V288 · Boss final authority
   V348 extension: Campaign bosses from Facile 5-11 onward follow the same
   3-stage-back pressure shift as normal Campaign enemies. The first shifted
   reference is floor 88 / Facile 5-8.

   Campaign boss HP anchors are FINAL post-spawn values. V322 stretches the
   historical 1..400 boss curve across the 1..800 Campaign while preserving
   the approved 5-stage Boss cadence. Mega Bosses still inherit the exact
   normal Campaign Boss then apply their existing x10 HP / x10 damage in
   makeMegaBossEnemy. */
(function(){
  'use strict';
  if(window.__srBossFinalV288)return;
  window.__srBossFinalV288=true;

  var CAMPAIGN_BALANCE_START=91;
  var CAMPAIGN_BALANCE_MIN=88;
  var CAMPAIGN_BALANCE_OFFSET=3;

  /* Legacy anchors stay documented here for compatibility/fallback. The active
     V322 authority is __srV285BossHP, which maps 1..800 onto these historical
     balance bands instead of letting raw floor numbers jump ahead on the old
     curve (for example the new Facile 3-10 / internal 50). */
  var BOSS_HP={
    5:500,10:2000,20:20000,30:180000,40:3000000,50:20000000,
    60:80000000,70:180000000,80:350000000,90:600000000,
    100:800000000,110:1000000000,120:1200000000,
    130:2200000000,140:4000000000,150:7000000000
  };

  function campaignBalanceFloorV348(floor){
    var f=Math.max(1,Math.min(800,Math.round(Number(floor)||1)));
    if(f<CAMPAIGN_BALANCE_START)return f;
    return Math.max(CAMPAIGN_BALANCE_MIN,f-CAMPAIGN_BALANCE_OFFSET);
  }

  function bossHP(floor){
    floor=campaignBalanceFloorV348(floor);
    if(typeof window.__srV285BossHP==='function')return window.__srV285BossHP(floor);
    if(BOSS_HP[floor]!=null)return BOSS_HP[floor];
    return null;
  }

  function semanticLegacyFloor(floor){
    var f=Math.max(1,Math.min(800,Number(floor)||1));
    return 1+(f-1)*399/799;
  }

  /* Boss damage stays tied to the same semantic world depth as V322 HP/damage,
     not to the doubled number of internal stages. V348 first shifts the Campaign
     reference back three stages from 5-11, matching the normal-enemy curve. */
  function legacyBossDamageStatMul(floor){
    var every=(typeof RULES!=='undefined'&&RULES.BOSS_EVERY)||10;
    var semantic=semanticLegacyFloor(campaignBalanceFloorV348(floor));
    var bossNo=Math.max(1,Math.min(10,Math.floor(semantic/every)));
    return 1+0.06*(bossNo-1);
  }

  try{
    if(typeof makeEnemy==='function'&&!makeEnemy.__srV288){
      var previousMakeEnemy=makeEnemy;
      makeEnemy=function(mode,opts){
        var enemy=previousMakeEnemy(mode,opts);
        if(mode!=='campaign'||!opts||!opts.boss||!enemy)return enemy;

        var target=bossHP(opts.floor);
        if(target!=null&&isFinite(target)&&target>0){
          enemy.hp=enemy.maxHP=Math.max(1,Math.floor(target));
        }

        try{
          var type=opts.type||{};
          var typeMul=Number(type.dmgMul);
          if(!isFinite(typeMul)||typeMul<=0)typeMul=1;
          var mulD=(Number(opts.floor)===40)?1.7:1.8;
          var firstBossMul=(Number(opts.floor)===5&&!opts.noFastback)?0.80:1;
          var base=(typeof enemyDamage==='function')?Number(enemyDamage(opts.floor)):NaN;
          if(isFinite(base)&&base>0){
            enemy.dmg=Math.max(1,Math.floor(base*typeMul*mulD*legacyBossDamageStatMul(opts.floor)*firstBossMul));
          }
        }catch(_){ }
        return enemy;
      };
      makeEnemy.__srV288=true;
    }
  }catch(_){ }

  window.__srBossFinalConfigV288={
    bossHP:BOSS_HP,resolvedBossHP:bossHP,damageStatMul:legacyBossDamageStatMul,semanticLegacyFloor:semanticLegacyFloor,
    campaign5_11Balance:{startFloor:CAMPAIGN_BALANCE_START,startStage:'5-11',minimumFloor:CAMPAIGN_BALANCE_MIN,minimumStage:'5-8',offset:CAMPAIGN_BALANCE_OFFSET,balanceFloor:campaignBalanceFloorV348}
  };
})();
