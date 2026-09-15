/* SHADOWREACH V338 · Campaign stage gold balance
   Slightly raises base campaign gold while preserving the existing progression curve.
   Raid rewards and tree bonuses are untouched. */
(function(){
  'use strict';
  if(window.__srStageGoldBalanceV338)return;
  window.__srStageGoldBalanceV338=true;

  var MUL=1.10;

  try{
    if(typeof goldReward==='function'&&!goldReward.__srStageGoldBalanceV338){
      var previousGoldReward=goldReward;
      goldReward=function(floor){
        return Math.max(1,Math.floor(Number(previousGoldReward.apply(this,arguments)||0)*MUL));
      };
      goldReward.__srStageGoldBalanceV338=true;
    }
  }catch(_){ }

  window.__srStageGoldBalanceConfigV338={baseGoldMultiplier:MUL,baseGoldIncreasePct:10};
})();

/* V339/V340 · One-time campaign gold compensation per save.
   V340 startup safety: compensation is never allowed to mutate/save the live
   state until the full page load has completed, which guarantees that the
   canonical game-5 boot() has already loaded the persisted save. */
(function(){
  'use strict';
  if(window.__srStageGoldCompensationV339)return;
  window.__srStageGoldCompensationV339=true;

  function legacyGoldReward(floor){
    var knee=25;
    var early=0.8*Math.pow(Math.min(floor,knee),0.72)+3;
    if(floor<=knee)return Math.floor(early);

    var at25=0.8*Math.pow(knee,0.72)+3;
    var value;
    if(floor<=300){
      value=at25*Math.pow(1.02,floor-25);
    }else{
      var at300=at25*Math.pow(1.02,300-25);
      if(floor<=500){
        value=at300*Math.pow(1.006,floor-300);
      }else{
        var at500=at300*Math.pow(1.006,500-300);
        if(floor<=750){
          value=at500*Math.pow(1.001,floor-500);
        }else{
          var at750=at500*Math.pow(1.001,750-500);
          value=at750*Math.pow(1.0005,floor-750);
        }
      }
    }
    if(typeof isBoss==='function'&&isBoss(floor))value*=1.40;
    else if(typeof isElite==='function'&&isElite(floor))value*=1.20;
    return Math.floor(value);
  }

  function enemiesForClearedFloor(floor){
    if(typeof isBoss==='function'&&isBoss(floor))return 1;
    var waves=typeof campaignWaveCount==='function'?campaignWaveCount(floor):((typeof RULES!=='undefined'&&RULES.STEPS_PER_FLOOR)||3);
    var total=0;
    for(var step=1;step<=waves;step++){
      if(typeof isElite==='function'&&isElite(floor)&&step===waves){
        total+=1;
      }else if(typeof enemyCount==='function'){
        total+=Math.max(1,Number(enemyCount(floor,step))||1);
      }else{
        total+=1;
      }
    }
    return total;
  }

  function compensationFor(recordFloor){
    var through=Math.max(0,Math.floor(Number(recordFloor)||1)-1);
    var total=0;
    for(var floor=1;floor<=through;floor++){
      var oldPerEnemy=legacyGoldReward(floor);
      var newPerEnemy=Math.max(1,Math.floor(oldPerEnemy*1.10));
      total+=(newPerEnemy-oldPerEnemy)*enemiesForClearedFloor(floor);
    }
    return {through:through,amount:Math.max(0,Math.floor(total))};
  }

  function applyWhenReady(attempt){
    try{
      if(document.readyState!=='complete'||typeof S==='undefined'||!S||typeof update!=='function'||typeof saveNow!=='function'||typeof enemyCount!=='function'||typeof campaignWaveCount!=='function'){
        if(attempt<60)setTimeout(function(){applyWhenReady(attempt+1);},100);
        return;
      }
      if(S.stageGoldCompensationV339)return;
      var record=Math.max(1,Math.floor(Number(S.recordFloor)||1));
      var calc=compensationFor(record);
      update(function(st){
        if(st.stageGoldCompensationV339)return;
        st.gold=(Number(st.gold)||0)+calc.amount;
        st.stageGoldCompensationV339={recordFloor:record,completedThrough:calc.through,amount:calc.amount};
      });
      saveNow();
    }catch(_){
      if(attempt<60)setTimeout(function(){applyWhenReady(attempt+1);},100);
    }
  }

  function startAfterBoot(){
    setTimeout(function(){applyWhenReady(0);},0);
  }

  window.__srStageGoldCompensationCalcV339=compensationFor;
  window.__srStageGoldCompensationStartupSafeV340=true;
  if(document.readyState==='complete')startAfterBoot();
  else window.addEventListener('load',startAfterBoot,{once:true});
})();
