/* SHADOWREACH V288 · Boss final authority
   QA correction for V285: campaign boss HP anchors are FINAL post-spawn values.
   Boss damage keeps the historical floor-based multiplier and is not polluted by
   the HP authority multiplier. Mega Bosses still inherit the exact normal boss
   then apply their existing x10 HP / x10 damage in makeMegaBossEnemy. */
(function(){
  'use strict';
  if(window.__srBossFinalV288)return;
  window.__srBossFinalV288=true;

  var BOSS_HP={
    10:2000,20:20000,30:180000,40:3000000,50:20000000,
    60:80000000,70:180000000,80:350000000,90:600000000,
    100:800000000,110:1000000000,120:1200000000,
    130:2200000000,140:4000000000,150:7000000000
  };

  function bossHP(floor){
    floor=Math.floor(Number(floor)||0);
    if(BOSS_HP[floor]!=null)return BOSS_HP[floor];
    if(typeof window.__srV285BossHP==='function')return window.__srV285BossHP(floor);
    return null;
  }

  /* This is the pre-V285 campaign boss stat multiplier. It remains the damage
     progression authority until a separate boss-damage curve is explicitly
     redesigned. */
  function legacyBossDamageStatMul(floor){
    var every=(typeof RULES!=='undefined'&&RULES.BOSS_EVERY)||10;
    var bossNo=Math.max(1,Math.min(10,Math.floor((Number(floor)||10)/every)));
    return 1+0.06*(bossNo-1);
  }

  try{
    if(typeof makeEnemy==='function'&&!makeEnemy.__srV288){
      var previousMakeEnemy=makeEnemy;
      makeEnemy=function(mode,opts){
        var enemy=previousMakeEnemy(mode,opts);
        if(mode!=='campaign'||!opts||!opts.boss||!enemy)return enemy;

        /* HP: exact final checkpoint. This deliberately overrides every tier,
           species and old boss HP multiplier that ran inside makeEnemy. */
        var target=bossHP(opts.floor);
        if(target!=null&&isFinite(target)&&target>0){
          enemy.hp=enemy.maxHP=Math.max(1,Math.floor(target));
        }

        /* Damage: rebuild from the historical boss damage formula so V285's
           HP ratio cannot multiply damage by hundreds/thousands. */
        try{
          var type=opts.type||{};
          var typeMul=Number(type.dmgMul);
          if(!isFinite(typeMul)||typeMul<=0)typeMul=1;
          var mulD=(Number(opts.floor)===40)?1.7:1.8;
          var firstBossMul=(Number(opts.floor)===10&&!opts.noFastback)?0.80:1;
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

  window.__srBossFinalConfigV288={bossHP:BOSS_HP,damageStatMul:legacyBossDamageStatMul};
})();