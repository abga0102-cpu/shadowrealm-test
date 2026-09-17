/* SHADOWREACH V344 · Forge dust integrity + one-time compensation
   Final authority loaded after every Forge/Dust layer.
   - Never changes the canonical Dust economy.
   - Verifies filtered Forge recycling and comparison-button recycling.
   - Tops up only a missing delta, so an already-correct credit is never doubled.
   - Grants one standardized one-time compensation for the affected Auto-Forge bug.
*/
(function(){
  'use strict';
  if(window.__srForgeDustIntegrityV344)return;
  window.__srForgeDustIntegrityV344=true;
  if(typeof S==='undefined'||!S.forge)return;

  var COMPENSATION=1000;
  var audit={forgeTopups:0,recycleTopups:0,compensation:0};

  function dustBalance(){
    var n=Number(S&&S.poussiere);
    return isFinite(n)?n:0;
  }

  function rarityDust(r){
    try{
      var cfg=window.__srDustEconomyConfigV293;
      var map=cfg&&cfg.byRarity;
      var n=map&&Number(map[r]);
      if(isFinite(n)&&n>=0)return Math.floor(n);
    }catch(_){}
    return 0;
  }

  function expectedResultDust(r){
    if(!r||!r.recycled)return 0;
    var n=Number(r.dust);
    if(isFinite(n)&&n>=0)return Math.floor(n);
    n=rarityDust(r.rarity);
    if(n>0)r.dust=n;
    return n;
  }

  function addMissingDust(amount,kind){
    amount=Math.max(0,Math.floor(Number(amount)||0));
    if(!amount)return 0;
    try{
      if(typeof update==='function')update(function(st){st.poussiere=(Number(st.poussiere)||0)+amount;});
      else {S.poussiere=(Number(S.poussiere)||0)+amount;if(typeof scheduleRender==='function')scheduleRender();}
      if(kind==='forge')audit.forgeTopups+=amount;
      else audit.recycleTopups+=amount;
      return amount;
    }catch(_){return 0;}
  }

  if(typeof forgeSummon==='function'){
    var nativeForgeSummon=forgeSummon;
    forgeSummon=function(){
      var before=dustBalance();
      var res=nativeForgeSummon.apply(this,arguments)||[];
      try{
        var expected=Array.isArray(res)?res.reduce(function(sum,r){return sum+expectedResultDust(r);},0):0;
        var credited=Math.max(0,dustBalance()-before);
        if(expected>credited)addMissingDust(expected-credited,'forge');
      }catch(e){console.warn('Forge dust integrity V344 audit skipped',e);}
      return res;
    };
    try{window.forgeSummon=forgeSummon;}catch(_){}
  }

  if(typeof recycleItem==='function'){
    var nativeRecycleItem=recycleItem;
    recycleItem=function(id){
      var item=null,expected=0,before=dustBalance();
      try{
        item=(S.inventory||[]).find(function(x){return x&&x.id===id;})||null;
        if(item&&typeof dustValue==='function')expected=Math.max(0,Math.floor(Number(dustValue(S,item))||0));
      }catch(_){}
      var reported=nativeRecycleItem.apply(this,arguments)||0;
      try{
        var stillThere=!!((S.inventory||[]).find(function(x){return x&&x.id===id;}));
        if(item&&!stillThere){
          var credited=Math.max(0,dustBalance()-before);
          if(expected>credited)addMissingDust(expected-credited,'recycle');
          return Math.max(Number(reported)||0,expected);
        }
      }catch(_){}
      return reported;
    };
    try{window.recycleItem=recycleItem;}catch(_){}
  }

  function grantCompensation(){
    try{
      if(typeof SMOKE!=='undefined'&&SMOKE)return;
      if(!S.forge||S.forge.dustCompensationV344)return;
      S.forge.dustCompensationV344={amount:COMPENSATION,claimedAt:Date.now()};
      S.poussiere=(Number(S.poussiere)||0)+COMPENSATION;
      audit.compensation=COMPENSATION;
      if(typeof saveNow==='function')saveNow();
      if(typeof scheduleRender==='function')scheduleRender();
      setTimeout(function(){
        try{if(typeof toast==='function')toast('Compensation Auto-Forge · +'+(typeof fmt==='function'?fmt(COMPENSATION):COMPENSATION)+' poussière',true);}catch(_){}
      },450);
    }catch(e){console.warn('Forge dust compensation V344 skipped',e);}
  }

  grantCompensation();
  window.__srForgeDustIntegrityV344Audit=audit;
})();
