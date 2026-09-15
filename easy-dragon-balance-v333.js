/* SHADOWREACH V333 · Facile 4-15 Dragon balance
   Targeted correction for Facile chapter 4 stage 15 (internal floor 75).
   Keeps the Dragon as a meaningful boss while removing the local difficulty spike.
   Later Dragon encounters and every other boss remain unchanged. */
(function(){
  'use strict';
  if(window.__srEasyDragonBalanceV333)return;
  window.__srEasyDragonBalanceV333=true;

  var TARGET_FLOOR=75;
  var HP_MUL=0.76;
  var BASE_DMG_MUL=0.88;

  function isTargetCombat(c){
    return !!(c&&c.ctx==='campaign'&&Number(c.floor)===TARGET_FLOOR);
  }

  /* Final spawn correction: V288 owns boss HP, so apply this after the final
     campaign boss authority rather than changing the global curve. */
  try{
    if(typeof makeEnemy==='function'&&!makeEnemy.__srEasyDragonBalanceV333){
      var previousMakeEnemy=makeEnemy;
      makeEnemy=function(mode,opts){
        var enemy=previousMakeEnemy(mode,opts);
        if(mode==='campaign'&&opts&&opts.boss&&Number(opts.floor)===TARGET_FLOOR&&enemy){
          enemy.maxHP=Math.max(1,Math.floor(Number(enemy.maxHP||enemy.hp||1)*HP_MUL));
          enemy.hp=enemy.maxHP;
          enemy.dmg=Math.max(1,Math.floor(Number(enemy.dmg||1)*BASE_DMG_MUL));
          enemy.__srEasyDragonV333=true;
        }
        return enemy;
      };
      makeEnemy.__srEasyDragonBalanceV333=true;
    }
  }catch(_){ }

  /* The ability object is mutable even though its binding is const. Patch only
     the floor-75 execution path; all other Dragon appearances use the originals. */
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

  window.__srEasyDragonBalanceConfigV333={
    floor:TARGET_FLOOR,stage:'Facile 4-15',hpMul:HP_MUL,baseDamageMul:BASE_DMG_MUL,
    breathMaxHpPct:33,breathCooldown:18,flightSeconds:3,flightCooldown:22,
    meleeDamageDuringFlightPct:40,intimidationPct:20,intimidationSeconds:6,intimidationCooldown:20
  };
})();
