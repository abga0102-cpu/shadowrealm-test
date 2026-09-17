/* SHADOWREACH V334 · Facile 4-15 + late-Easy progression balance
   V348 extension: from Facile 5-11, the late-Easy final multipliers use the
   same 3-stage-back reference as the Campaign HP/damage authorities. This keeps
   5-11 at the 5-8 final-pressure floor instead of over-reducing it.
   - Keeps the targeted Dragon correction on Facile 4-15 (internal floor 75).
   - Smooths the remaining Facile campaign from 4-16 through 5-20 (floors 76..100).
   - Fixes the late-Easy spike where damage accelerated much faster than HP. */
(function(){
  'use strict';
  if(window.__srEasyDragonBalanceV334)return;
  window.__srEasyDragonBalanceV334=true;

  var TARGET_FLOOR=75;
  var LATE_EASY_START=76;
  var LATE_EASY_END=100;
  var HP_MUL=0.76;
  var BASE_DMG_MUL=0.88;
  var CAMPAIGN_BALANCE_START=91;
  var CAMPAIGN_BALANCE_MIN=88;
  var CAMPAIGN_BALANCE_OFFSET=3;

  function isTargetCombat(c){
    return !!(c&&c.ctx==='campaign'&&Number(c.floor)===TARGET_FLOOR);
  }
  function campaignBalanceFloorV348(floor){
    var f=Math.max(1,Math.min(800,Math.round(Number(floor)||1)));
    if(f<CAMPAIGN_BALANCE_START)return f;
    return Math.max(CAMPAIGN_BALANCE_MIN,f-CAMPAIGN_BALANCE_OFFSET);
  }
  function clamp01(v){return Math.max(0,Math.min(1,Number(v)||0));}
  function lerp(a,b,t){return a+(b-a)*clamp01(t);}
  function lateEasyT(floor){return clamp01((Number(floor)-LATE_EASY_START)/(LATE_EASY_END-LATE_EASY_START));}
  function lateEasyHpMul(floor,isBoss){
    var t=lateEasyT(floor);
    return isBoss?lerp(0.70,0.35,t):lerp(0.90,0.52,t);
  }
  function lateEasyDamageMul(floor){return lerp(0.98,0.30,lateEasyT(floor));}

  /* Final spawn correction. V288 owns boss HP and V289 owns campaign enemy
     pressure, so this wrapper runs after both and only adjusts the final enemy. */
  try{
    if(typeof makeEnemy==='function'&&!makeEnemy.__srEasyBalanceV334){
      var previousMakeEnemy=makeEnemy;
      makeEnemy=function(mode,opts){
        var enemy=previousMakeEnemy(mode,opts);
        if(mode!=='campaign'||!opts||!enemy)return enemy;
        var floor=Number(opts.floor)||0;

        if(opts.boss&&floor===TARGET_FLOOR){
          enemy.maxHP=Math.max(1,Math.floor(Number(enemy.maxHP||enemy.hp||1)*HP_MUL));
          enemy.hp=enemy.maxHP;
          enemy.dmg=Math.max(1,Math.floor(Number(enemy.dmg||1)*BASE_DMG_MUL));
          enemy.__srEasyDragonV334=true;
          return enemy;
        }

        if(floor>=LATE_EASY_START&&floor<=LATE_EASY_END){
          var balanceFloor=campaignBalanceFloorV348(floor);
          var hpMul=lateEasyHpMul(balanceFloor,!!opts.boss);
          var dmgMul=lateEasyDamageMul(balanceFloor);
          enemy.maxHP=Math.max(1,Math.floor(Number(enemy.maxHP||enemy.hp||1)*hpMul));
          enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.floor(Number(enemy.hp||enemy.maxHP||1)*hpMul)));
          enemy.dmg=Math.max(1,Math.floor(Number(enemy.dmg||1)*dmgMul));
          enemy.__srLateEasyBalanceV334={hpMul:hpMul,dmgMul:dmgMul,balanceFloor:balanceFloor};
        }
        return enemy;
      };
      makeEnemy.__srEasyBalanceV334=true;
    }
  }catch(_){ }

  /* Dragon mechanics remain softened only on 4-15. */
  try{
    if(typeof BOSS_ABIL!=='undefined'&&BOSS_ABIL){
      if(BOSS_ABIL.souffle&&typeof BOSS_ABIL.souffle.tick==='function'){
        var oldBreathTick=BOSS_ABIL.souffle.tick;
        BOSS_ABIL.souffle.tick=function(c,e,dt){
          if(!isTargetCombat(c))return oldBreathTick.apply(this,arguments);
          if(e.breathWind>0){
            e.breathWind=Math.max(0,e.breathWind-dt);
            if(e.breathWind>0)return;
            var raw=Math.floor(c.heroMaxHP*0.33);
            var d=Math.max(1,Math.floor(raw*(1-heroDmgRed(c)/100)));
            c.heroHP-=d;c.heroHit=0.3;
            addShake(c,10);addBurst(c,'crit',c.heroX,'#FF7A3D');
            c.floats.push({id:rid(),x:c.heroX,val:d,crit:true,color:'#FF7A3D',born:Date.now()});
            if(c.heroHP<=0){c.heroHP=0;c.status='lost';}
            return;
          }
          e.breathCd=(e.breathCd==null?4:e.breathCd)-dt;
          if(e.breathCd<=0){e.breathCd=18;e.breathWind=2;addBurst(c,'hit',e.x,'#FF7A3D');addShake(c,4);}
        };
      }

      if(BOSS_ABIL.envol&&typeof BOSS_ABIL.envol.tick==='function'){
        var oldFlyTick=BOSS_ABIL.envol.tick;
        var oldFlyFilter=BOSS_ABIL.envol.filter;
        BOSS_ABIL.envol.tick=function(c,e,dt){
          if(!isTargetCombat(c))return oldFlyTick.apply(this,arguments);
          var wasFlying=Number(e.flying||0)>0;
          oldFlyTick.apply(this,arguments);
          if(!wasFlying&&Number(e.flying||0)>=3.9){
            e.flying=3;
            if(Number(e.flyCd||0)===21)e.flyCd=22;
          }
        };
        if(typeof oldFlyFilter==='function'){
          BOSS_ABIL.envol.filter=function(c,e,dmg,src){
            if(!isTargetCombat(c)||!(e&&e.flying>0))return oldFlyFilter.apply(this,arguments);
            if(src!=='weapon'||RANGED_IDS.indexOf(D.weapon)>=0)return dmg;
            var glancing=Math.max(1,Math.floor(Number(dmg||0)*0.40));
            c.floats.push({id:rid(),x:e.x,val:glancing,crit:false,color:'#B15CF6',born:Date.now(),text:'ENVOL · 40%'});
            return glancing;
          };
        }
      }

      if(BOSS_ABIL.intimidation&&typeof BOSS_ABIL.intimidation.tick==='function'){
        var oldIntimTick=BOSS_ABIL.intimidation.tick;
        BOSS_ABIL.intimidation.tick=function(c,e,dt){
          if(!isTargetCombat(c))return oldIntimTick.apply(this,arguments);
          e.intimCd=(e.intimCd==null?3:e.intimCd)-dt;
          if(e.intimCd>0)return;
          e.intimCd=20;
          fxAdd(c,'debuffs',{key:'intimide',value:20,label:'Intimidation',dur:6},Date.now());
          addBurst(c,'crit',c.heroX,'#FF5A5A');addShake(c,5);
        };
      }
    }
  }catch(_){ }

  window.__srEasyDragonBalanceConfigV334={
    dragonFloor:TARGET_FLOOR,dragonStage:'Facile 4-15',dragonHpMul:HP_MUL,dragonBaseDamageMul:BASE_DMG_MUL,
    dragonBreathMaxHpPct:33,dragonBreathCooldown:18,dragonFlightSeconds:3,dragonFlightCooldown:22,
    dragonMeleeDamageDuringFlightPct:40,dragonIntimidationPct:20,dragonIntimidationSeconds:6,dragonIntimidationCooldown:20,
    lateEasy:{startFloor:LATE_EASY_START,endFloor:LATE_EASY_END,normalHpMulStart:0.90,normalHpMulEnd:0.52,bossHpMulStart:0.70,bossHpMulEnd:0.35,damageMulStart:0.98,damageMulEnd:0.30},
    campaign5_11Balance:{startFloor:CAMPAIGN_BALANCE_START,startStage:'5-11',minimumFloor:CAMPAIGN_BALANCE_MIN,minimumStage:'5-8',offset:CAMPAIGN_BALANCE_OFFSET,balanceFloor:campaignBalanceFloorV348}
  };
})();
